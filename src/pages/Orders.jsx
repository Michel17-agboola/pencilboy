import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, ShoppingBag, MessageCircle, MapPin, Mail, PackageCheck } from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatNaira, formatDate } from "../lib/format";

const ORDER_STATUSES = ["PENDING", "APPROVED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const FILTERS = ["ALL", ...ORDER_STATUSES];

function cleanPhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `234${digits.slice(1)}`;
  if (digits.startsWith("234")) return digits;
  return digits;
}

function OrderStatus({ status }) {
  const value = String(status || "PENDING").toUpperCase();
  return <span className={`orders-status orders-status--${value.toLowerCase()}`}>{value}</span>;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const [ordersResult, itemsResult] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("order_items").select("*").order("created_at", { ascending: false }),
      ]);
      if (ordersResult.error) throw ordersResult.error;
      if (itemsResult.error) throw itemsResult.error;
      setOrders(ordersResult.data || []);
      setItems(itemsResult.data || []);
    } catch (err) {
      setError(err?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const channel = supabase
      .channel("admin-orders-module")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadOrders(true))
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => loadOrders(true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadOrders]);

  const counts = useMemo(() => {
    const result = Object.fromEntries(FILTERS.map((status) => [status, 0]));
    orders.forEach((order) => {
      const status = String(order.status || "PENDING").toUpperCase();
      result.ALL += 1;
      if (status in result) result[status] += 1;
    });
    return result;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      const status = String(order.status || "PENDING").toUpperCase();
      if (filter !== "ALL" && status !== filter) return false;
      if (!needle) return true;
      return [order.customer_name, order.email, order.phone, order.id, order.shipping_address, order.city]
        .some((value) => String(value || "").toLowerCase().includes(needle));
    });
  }, [orders, query, filter]);

  async function updateStatus(orderId, status) {
    setUpdatingId(orderId);
    setError("");
    setNotice("");
    const updatedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status, updated_at: updatedAt })
      .eq("id", orderId);
    if (updateError) {
      setError(updateError.message || "Could not update this order.");
    } else {
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status, updated_at: updatedAt } : order));
      setNotice(`Order status updated to ${status.toLowerCase()}.`);
    }
    setUpdatingId("");
  }

  function openWhatsApp(order) {
    const phone = cleanPhone(order.phone);
    if (!phone) {
      setError("This order has no customer phone number saved.");
      return;
    }
    const message = `Hello ${order.customer_name || "there"}, this is Pencilboy following up on your order ${order.id}. Your current order status is ${order.status || "PENDING"}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="admin-orders-page">
      <div className="admin-page-heading admin-orders-heading">
        <div>
          <span>STORE MANAGEMENT</span>
          <h1>Orders</h1>
          <p>Review customer orders, verify payments and manage fulfilment from one place.</p>
        </div>
        <button className="admin-secondary-button orders-refresh" type="button" onClick={() => loadOrders(true)} disabled={refreshing}>
          <RefreshCw size={15} className={refreshing ? "dashboard-spin" : ""} />
          {refreshing ? "REFRESHING" : "REFRESH ORDERS"}
        </button>
      </div>

      {error && <div className="orders-feedback orders-feedback--error" role="alert">{error}</div>}
      {notice && <div className="orders-feedback" role="status">{notice}</div>}

      <div className="orders-overview">
        <div><span>Total orders</span><strong>{counts.ALL}</strong></div>
        <div><span>Awaiting verification</span><strong>{counts.PENDING}</strong></div>
        <div><span>Approved</span><strong>{counts.APPROVED}</strong></div>
        <div><span>In fulfilment</span><strong>{counts.PROCESSING + counts.SHIPPED}</strong></div>
      </div>

      <div className="orders-toolbar">
        <label className="orders-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, email or order ID" /></label>
        <div className="orders-filters" aria-label="Filter orders by status">
          {FILTERS.map((status) => <button key={status} type="button" className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>{status === "ALL" ? "All" : status.replace("_", " ")}<span>{counts[status]}</span></button>)}
        </div>
      </div>

      {loading ? (
        <div className="orders-empty"><RefreshCw className="dashboard-spin" size={20} /> Loading orders…</div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty"><ShoppingBag size={25} /><strong>No orders found</strong><span>{orders.length ? "Try another search or status filter." : "New customer orders will appear here after checkout is submitted."}</span></div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const orderItems = items.filter((item) => item.order_id === order.id);
            const status = String(order.status || "PENDING").toUpperCase();
            return (
              <article className="orders-card" key={order.id}>
                <div className="orders-card-top">
                  <div className="orders-customer">
                    <span className="orders-avatar">{String(order.customer_name || "G").trim().charAt(0).toUpperCase()}</span>
                    <div><strong>{order.customer_name || "Guest customer"}</strong><span>{order.email || "No email"}</span></div>
                  </div>
                  <div className="orders-total"><span>ORDER TOTAL</span><strong>{formatNaira(order.total)}</strong></div>
                </div>

                <div className="orders-card-meta">
                  <span><small>ORDER REFERENCE</small><strong>#{String(order.id).slice(-8).toUpperCase()}</strong></span>
                  <span><small>PLACED</small><strong>{formatDate(order.created_at)}</strong></span>
                  <span><small>PHONE</small><strong>{order.phone || "Not provided"}</strong></span>
                </div>

                <div className="orders-card-content">
                  <div className="orders-items-block">
                    <span className="orders-label"><PackageCheck size={13} /> ITEMS</span>
                    {orderItems.length ? orderItems.map((item) => (
                      <div className="orders-item" key={item.id}><span>{item.product_name || "Product"}{item.size ? ` · ${item.size}` : ""}</span><strong>× {item.quantity}</strong></div>
                    )) : <span className="orders-muted">No item details available.</span>}
                  </div>
                  <div className="orders-delivery-block">
                    <span className="orders-label"><MapPin size={13} /> DELIVERY</span>
                    <p>{[order.shipping_address, order.city].filter(Boolean).join(", ") || "Address not provided"}</p>
                    <a href={`mailto:${encodeURIComponent(order.email || "")}`}><Mail size={13} /> Email customer</a>
                  </div>
                </div>

                <div className="orders-card-footer">
                  <div className="orders-status-control"><OrderStatus status={status} /><label className="sr-only" htmlFor={`order-status-${order.id}`}>Update order status</label><select id={`order-status-${order.id}`} value={status} disabled={updatingId === order.id} onChange={(event) => updateStatus(order.id, event.target.value)}>{ORDER_STATUSES.map((option) => <option value={option} key={option}>{option.replace("_", " ")}</option>)}</select>{updatingId === order.id && <small>Saving…</small>}</div>
                  <button type="button" className="orders-whatsapp" onClick={() => openWhatsApp(order)}><MessageCircle size={15} /> CONTACT ON WHATSAPP</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
