import { useState } from "react";
import PageIntro from "../components/PageIntro";
import { supabase } from "../lib/supabase";

const money = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

export default function Checkout({ cart, user, navigate, clearCart }) {
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Lagos");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          customer_id: user?.id || null,
          email,
          customer_name: name,
          shipping_address: address,
          city,
          total,
          status: "PENDING",
          item_count: cart.reduce((sum, item) => sum + item.qty, 0)
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("order_items").insert(
        cart.map((item) => ({
          order_id: order.id,
          product_id: String(item.id).startsWith("demo-") ? null : item.id,
          product_name: item.name,
          quantity: item.qty,
          unit_price: item.price,
          size: item.size
        }))
      );

      clearCart();
      setDone(true);
    } catch (error) {
      alert(error.message || "Unable to place order.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <section className="success-page">
        <span className="eyebrow">ORDER RECEIVED</span>
        <h1>THANK YOU.</h1>
        <p>Your PENCILBOY order has been received. We’ll be in touch with the next step.</p>
        <a className="text-link" href="#/account">VIEW ORDER STATUS →</a>
      </section>
    );
  }

  return (
    <>
      <PageIntro eyebrow="CHECKOUT" title="YOUR ORDER" />

      <form className="checkout-grid" onSubmit={submit}>
        <div>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Shipping address<textarea value={address} onChange={(e) => setAddress(e.target.value)} required /></label>
          <label>City<input value={city} onChange={(e) => setCity(e.target.value)} required /></label>
        </div>

        <aside>
          <span className="eyebrow">SUMMARY</span>
          {cart.map((item) => (
            <p key={`${item.id}-${item.size}`}>
              {item.name} × {item.qty}
              <b>{money(item.price * item.qty)}</b>
            </p>
          ))}
          <hr />
          <h3>TOTAL <b>{money(total)}</b></h3>
          <button className="add-bag" disabled={loading || !cart.length}>
            {loading ? "PLACING ORDER…" : "PLACE ORDER"}
          </button>
        </aside>
      </form>
    </>
  );
}
