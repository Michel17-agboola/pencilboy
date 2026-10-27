import { useEffect, useState } from "react";
import PageIntro from "../components/PageIntro";
import { supabase } from "../lib/supabase";


import { formatNaira } from "../lib/format";
export default function Account({ user, navigate, onSignOut }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data || []);
    }

    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <section className="account-gate">
        <span className="eyebrow">CUSTOMER</span>
        <h1>ACCOUNT</h1>
        <p>Sign in to view orders, saved items and addresses.</p>
        <button className="add-bag" onClick={() => navigate("/signin")}>SIGN IN</button>
      </section>
    );
  }

  return (
    <>
      <PageIntro eyebrow="CUSTOMER" title="ACCOUNT">
        SIGNED IN AS {user.email?.toUpperCase()}
      </PageIntro>

      <section className="account-grid">
        <aside>
          <button className="active">ORDERS</button>
          <button>SAVED</button>
          <button>DETAILS</button>
          <button>ADDRESSES</button>
          <button onClick={onSignOut}>SIGN OUT →</button>
        </aside>

        <div className="orders">
          {orders.length ? orders.map((order) => (
            <article key={order.id}>
              <div>
                <strong>{order.order_number || `PB-${String(order.id).slice(0, 6).toUpperCase()}`}</strong>
                <p>{new Date(order.created_at).toLocaleDateString("en-GB")} · {order.item_count || 1} ITEM(S)</p>
              </div>
              <span>{(order.status || "PROCESSING").toUpperCase()} <b>{formatNaira(order.total)}</b></span>
            </article>
          )) : (
            <div className="empty-block">
              No orders yet. <a href="#/drops">Start shopping →</a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
