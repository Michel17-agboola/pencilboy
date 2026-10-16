import {
  Minus,
  Plus,
  X,
  ArrowRight,
} from "lucide-react";
import PageIntro from "../components/PageIntro";

const money = (n) =>
  `₦${Number(
    n || 0
  ).toLocaleString("en-NG")}`;

const firstImage = (p) =>
  Array.isArray(p?.images)
    ? p.images[0]
    : p?.image_url || "";

export default function Bag({
  cart,
  setCart,
  navigate,
}) {
  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.qty || 0),
    0
  );

  const update = (
    id,
    size,
    delta
  ) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id &&
        item.size === size
          ? {
              ...item,
              qty: Math.max(
                1,
                item.qty + delta
              ),
            }
          : item
      )
    );
  };

  return (
    <>
      <PageIntro
        eyebrow="YOUR SELECTION"
        title="CART"
      />

      <section className="bag-section">
        {!cart.length ? (
          <div className="empty-block">
            <h2>
              YOUR CART IS EMPTY.
            </h2>

            <a
              className="text-link"
              href="#/shop"
            >
              CONTINUE SHOPPING{" "}
              <ArrowRight />
            </a>
          </div>
        ) : (
          <>
            <div className="bag-list">
              {cart.map((item) => (
                <article
                  key={`${item.id}-${item.size}`}
                >
                  <img
                    src={firstImage(item)}
                    alt={item.name}
                  />

                  <div>
                    <span>
                      {item.category}
                    </span>

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      SIZE ·{" "}
                      {item.size}
                    </p>

                    <div className="quantity">
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            item.id,
                            item.size,
                            -1
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus />
                      </button>

                      <b>
                        {item.qty}
                      </b>

                      <button
                        type="button"
                        onClick={() =>
                          update(
                            item.id,
                            item.size,
                            1
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus />
                      </button>
                    </div>
                  </div>

                  <strong>
                    {money(
                      item.price *
                        item.qty
                    )}
                  </strong>

                  <button
                    type="button"
                    className="remove"
                    onClick={() =>
                      setCart((current) =>
                        current.filter(
                          (x) =>
                            !(
                              x.id ===
                                item.id &&
                              x.size ===
                                item.size
                            )
                        )
                      )
                    }
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <X />
                  </button>
                </article>
              ))}
            </div>

            <div className="bag-total">
              <span>TOTAL</span>

              <strong>
                {money(total)}
              </strong>

              <button
                type="button"
                className="add-bag"
                onClick={() =>
                  navigate(
                    "/checkout"
                  )
                }
              >
                CHECKOUT
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}