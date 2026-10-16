import {
  ArrowLeft,
  Minus,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { trackProductView } from "../lib/storeTracking";

const money = (n) =>
  `₦${Number(
    n || 0
  ).toLocaleString("en-NG")}`;

const firstImage = (p) =>
  Array.isArray(p?.images)
    ? p.images[0]
    : p?.image_url || "";

export default function Product({
  product,
  onBack,
  addToBag,
}) {
  const [size, setSize] = useState(
    product.sizes?.[0] || "OS"
  );

  const [qty, setQty] = useState(1);

  /*
   * -------------------------------------------------------
   * PRODUCT VIEW TRACKING
   * -------------------------------------------------------
   *
   * Every time a product page is opened, record one
   * PRODUCT_VIEW event in Supabase.
   *
   * Tracking is non-blocking, so it cannot interfere
   * with the customer's shopping experience.
   */

  useEffect(() => {
    if (!product?.id) {
      return;
    }

    trackProductView(product.id);
  }, [product?.id]);

  return (
    <section className="product-detail">
      <button
        type="button"
        className="back-link"
        onClick={onBack}
      >
        <ArrowLeft />
        BACK
      </button>

      <div className="product-detail-grid">
        <div className="product-gallery">
          <img
            src={firstImage(product)}
            alt={product.name}
          />
        </div>

        <div className="product-info">
          <span className="eyebrow">
            {product.category ||
              "PENCILBOY"}
          </span>

          <h1>
            {product.name}
          </h1>

          <strong className="detail-price">
            {money(product.price)}
          </strong>

          <p>
            {product.description ||
              "A PENCILBOY release. Made in Lagos."}
          </p>

          <div className="option-block">
            <span>SIZE</span>

            <div className="size-row">
              {(
                product.sizes || [
                  "OS",
                ]
              ).map((s) => (
                <button
                  type="button"
                  key={s}
                  className={
                    size === s
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setSize(s)
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="quantity">
            <span>
              QUANTITY
            </span>

            <button
              type="button"
              onClick={() =>
                setQty(
                  Math.max(
                    1,
                    qty - 1
                  )
                )
              }
              aria-label="Decrease quantity"
            >
              <Minus />
            </button>

            <b>{qty}</b>

            <button
              type="button"
              onClick={() =>
                setQty(
                  Math.min(
                    product.stock ||
                      99,
                    qty + 1
                  )
                )
              }
              aria-label="Increase quantity"
            >
              <Plus />
            </button>
          </div>

          <button
            type="button"
            className="add-bag"
            disabled={
              product.stock <= 0
            }
            onClick={() =>
              addToBag(
                product,
                size,
                qty
              )
            }
          >
            {product.stock <= 0
              ? "SOLD OUT"
              : "ADD TO CART"}
          </button>

          <p className="product-note">
            Ships from Lagos within
            3–5 business days.
          </p>
        </div>
      </div>
    </section>
  );
}