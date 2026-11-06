import { useState } from "react";
import PageIntro from "../components/PageIntro";
import { supabase } from "../lib/supabase";
import { formatNaira } from "../lib/format";

const PENCILBOY_WHATSAPP = "2348133472550";

export default function Checkout({ cart, user, clearCart }) {
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Lagos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);

  async function submit(event) {
    event.preventDefault();
    if (!cart.length) return;

    setLoading(true);
    setError("");

    try {
      const items = cart.map((item) => {
        const productId = String(item.id || "");
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId)) {
          throw new Error(`“${item.name || "A cart item"}” is not linked to a published store product. Please remove it and add the product again.`);
        }
        return {
          product_id: productId,
          quantity: Number(item.qty),
          size: item.size || null,
        };
      });

      const { data, error: orderError } = await supabase.rpc("place_pencilboy_order", {
        p_email: email.trim(),
        p_customer_name: name.trim(),
        p_phone: phone.trim(),
        p_shipping_address: address.trim(),
        p_city: city.trim(),
        p_items: items,
      });

      if (orderError) throw orderError;

      const savedOrder = Array.isArray(data) ? data[0] : data;
      if (!savedOrder?.order_id) {
        throw new Error("The order could not be confirmed by the store. Please try again.");
      }

      const orderId = savedOrder.order_id;
      const confirmedTotal = Number(savedOrder.order_total);
      const message = [
        "Hello Pencilboy! I'd like to confirm my order.",
        "",
        `Order reference: ${orderId}`,
        `Name: ${name.trim()}`,
        `Phone: ${phone.trim()}`,
        `Email: ${email.trim()}`,
        `Delivery address: ${address.trim()}, ${city.trim()}`,
        "",
        "ORDER ITEMS:",
        ...cart.map((item) => `${item.name} | Size: ${item.size || "N/A"} | Qty: ${item.qty} | Listed price: ${formatNaira(Number(item.price || 0))}`),
        "",
        `Order total: ${formatNaira(confirmedTotal)}`,
        "Order status: PENDING",
        "",
        "Please confirm availability and delivery details. Thank you.",
      ].join("\n");

      clearCart();
      window.location.assign(`https://wa.me/${PENCILBOY_WHATSAPP}?text=${encodeURIComponent(message)}`);
    } catch (submitError) {
      setError(submitError.message || "Unable to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageIntro eyebrow="CHECKOUT" title="YOUR ORDER" />

      <form className="checkout-grid" onSubmit={submit}>
        <div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Phone number<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 08012345678" autoComplete="tel" required /></label>
          <label>Shipping address<textarea value={address} onChange={(e) => setAddress(e.target.value)} required /></label>
          <label>City<input value={city} onChange={(e) => setCity(e.target.value)} required /></label>
        </div>

        <aside>
          <span className="eyebrow">SUMMARY</span>
          {cart.map((item) => (
            <p key={`${item.id}-${item.size}`}>
              {item.name} × {item.qty}
              <b>{formatNaira(item.price * item.qty)}</b>
            </p>
          ))}
          <hr />
          <h3>TOTAL <b>{formatNaira(total)}</b></h3>
          <button className="add-bag" disabled={loading || !cart.length}>
            {loading ? "SAVING ORDER…" : "PLACE ORDER"}
          </button>
          <small>Your order will be saved and WhatsApp will open so you can send the order details to Pencilboy.</small>
        </aside>
      </form>
    </>
  );
}
