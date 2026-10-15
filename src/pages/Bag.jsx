import { Minus, Plus, X, ArrowRight } from "lucide-react";
import PageIntro from "../components/PageIntro";

const money = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const firstImage = (p) => Array.isArray(p?.images) ? p.images[0] : p?.image_url || "";

export default function Bag({ cart, setCart, navigate }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const update = (id, size, delta) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id && item.size === size
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  return (
    <>
      <PageIntro eyebrow="YOUR SELECTION" title="BAG" />

      <section className="bag-section">
        {!cart.length ? (
          <div className="empty-block">
            <h2>YOUR BAG IS EMPTY.</h2>
            <a className="text-link" href="#/drops">EXPLORE DROPS <ArrowRight /></a>
          </div>
        ) : (
          <>
            <div className="bag-list">
              {cart.map((item) => (
                <article key={`${item.id}-${item.size}`}>
                  <img src={firstImage(item)} alt={item.name} />
                  <div>
                    <span>{item.category}</span>
                    <h3>{item.name}</h3>
                    <p>SIZE · {item.size}</p>
                    <div className="quantity">
                      <button onClick={() => update(item.id, item.size, -1)}><Minus /></button>
                      <b>{item.qty}</b>
                      <button onClick={() => update(item.id, item.size, 1)}><Plus /></button>
                    </div>
                  </div>
                  <strong>{money(item.price * item.qty)}</strong>
                  <button className="remove" onClick={() => setCart((c) => c.filter((x) => !(x.id === item.id && x.size === item.size)))}><X /></button>
                </article>
              ))}
            </div>

            <div className="bag-total">
              <span>TOTAL</span>
              <strong>{money(total)}</strong>
              <button className="add-bag" onClick={() => navigate("/checkout")}>CHECKOUT</button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
