import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";

const money = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const firstImage = (p) => Array.isArray(p?.images) ? p.images[0] : p?.image_url || "";

export default function Product({ product, onBack, addToBag }) {
  const [size, setSize] = useState(product.sizes?.[0] || "OS");
  const [qty, setQty] = useState(1);

  return (
    <section className="product-detail">
      <button className="back-link" onClick={onBack}><ArrowLeft /> BACK</button>

      <div className="product-detail-grid">
        <div className="product-gallery">
          <img src={firstImage(product)} alt={product.name} />
        </div>

        <div className="product-info">
          <span className="eyebrow">{product.category || "PENCILBOY"}</span>
          <h1>{product.name}</h1>
          <strong className="detail-price">{money(product.price)}</strong>
          <p>{product.description || "A PENCILBOY release. Made in Lagos."}</p>

          <div className="option-block">
            <span>SIZE</span>
            <div className="size-row">
              {(product.sizes || ["OS"]).map((s) => (
                <button key={s} className={size === s ? "selected" : ""} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="quantity">
            <span>QUANTITY</span>
            <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus /></button>
            <b>{qty}</b>
            <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}><Plus /></button>
          </div>

          <button className="add-bag" disabled={product.stock <= 0} onClick={() => addToBag(product, size, qty)}>
            {product.stock <= 0 ? "SOLD OUT" : "ADD TO BAG"}
          </button>

          <p className="product-note">Ships from Lagos within 3–5 business days.</p>
        </div>
      </div>
    </section>
  );
}
