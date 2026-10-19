import {
  ArrowLeft,
  Minus,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { trackProductView } from "../lib/storeTracking";

const money = (n) =>
  `₦${Number(
    n || 0
  ).toLocaleString("en-NG")}`;

const getImages = (product) => {
  if (
    Array.isArray(product?.images) &&
    product.images.length
  ) {
    return product.images;
  }

  if (product?.image_url) {
    return [product.image_url];
  }

  return [];
};

export default function Product({
  product,
  onBack,
  addToBag,
}) {
  const images = getImages(product);

  const [activeImage, setActiveImage] =
    useState(0);

  const [size, setSize] =
    useState(
      product?.sizes?.[0] || "OS"
    );

  const [color, setColor] =
    useState(
      product?.colors?.[0] || ""
    );

  const [qty, setQty] =
    useState(1);

  const [descriptionOpen, setDescriptionOpen] =
    useState(false);

  const [sizeGuideOpen, setSizeGuideOpen] =
    useState(false);

  useEffect(() => {
    if (!product?.id) return;

    trackProductView(product.id);
  }, [product?.id]);

  useEffect(() => {
    setActiveImage(0);

    setSize(
      product?.sizes?.[0] || "OS"
    );

    setColor(
      product?.colors?.[0] || ""
    );

    setQty(1);
  }, [product?.id]);

  const stock = Number(
    product?.stock || 0
  );

  const isSoldOut = stock <= 0;

  const currentImage =
    images[activeImage] ||
    images[0] ||
    "";

  return (
    <section className="product-detail">
      <button
        type="button"
        className="back-link"
        onClick={onBack}
      >
        <ArrowLeft size={15} />
        BACK
      </button>

      <div className="product-detail-grid">
        {/* PRODUCT MEDIA */}
        <div className="product-gallery">
          <div className="product-main-image">
            {currentImage ? (
              <img
                src={currentImage}
                alt={
                  product?.name ||
                  "PENCILBOY product"
                }
              />
            ) : (
              <div className="image-placeholder">
                NO IMAGE
              </div>
            )}

            {images.length > 1 && (
              <span className="product-image-count">
                {activeImage + 1} /{" "}
                {images.length}
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="product-thumbnails">
              {images.map(
                (image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    className={
                      activeImage === index
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveImage(
                        index
                      )
                    }
                    aria-label={`View image ${
                      index + 1
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                    />
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="product-info">
          <span className="product-detail-category">
            {product?.categories?.name ||
              product?.category ||
              "PENCILBOY"}
          </span>

          <h1>
            {product?.name}
          </h1>

          <div className="product-price-row">
            <strong className="detail-price">
              {money(product?.price)}
            </strong>

            {product?.compare_at_price &&
              Number(
                product.compare_at_price
              ) >
                Number(
                  product.price
                ) && (
                <span className="compare-price">
                  {money(
                    product.compare_at_price
                  )}
                </span>
              )}
          </div>

          {isSoldOut && (
            <span className="sold-out-label">
              SOLD OUT
            </span>
          )}

          <p className="product-shipping-note">
            Tax included. Shipping
            calculated at checkout.
          </p>

          {/* SIZE */}
          <div className="option-block">
            <div className="option-heading">
              <span>SIZE</span>
            </div>

            <div className="size-row">
              {(
                product?.sizes || [
                  "OS",
                ]
              ).map((item) => (
                <button
                  type="button"
                  key={item}
                  className={
                    size === item
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setSize(item)
                  }
                  disabled={isSoldOut}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* COLOUR */}
          {product?.colors?.length >
            0 && (
            <div className="option-block product-color-block">
              <div className="option-heading">
                <span>
                  COLOUR
                </span>
              </div>

              <div className="color-row">
                {product.colors.map(
                  (item) => (
                    <button
                      type="button"
                      key={item}
                      className={
                        color === item
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setColor(item)
                      }
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="product-quantity-block">
            <span>QUANTITY</span>

            <div className="quantity-control">
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
                disabled={isSoldOut}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>

              <strong>
                {qty}
              </strong>

              <button
                type="button"
                onClick={() =>
                  setQty(
                    Math.min(
                      stock || 99,
                      qty + 1
                    )
                  )
                }
                disabled={isSoldOut}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            type="button"
            className="add-bag product-add-cart"
            disabled={isSoldOut}
            onClick={() =>
              addToBag(
                product,
                size,
                qty
              )
            }
          >
            {isSoldOut
              ? "SOLD OUT"
              : "ADD TO CART"}
          </button>

          {/* ACCORDIONS */}
          <div className="product-accordions">
            <div className="product-accordion">
              <button
                type="button"
                onClick={() =>
                  setDescriptionOpen(
                    (value) =>
                      !value
                  )
                }
              >
                <span>
                  PRODUCT DESCRIPTION
                </span>

                <ChevronDown
                  size={17}
                  className={
                    descriptionOpen
                      ? "open"
                      : ""
                  }
                />
              </button>

              {descriptionOpen && (
                <div className="product-accordion-content">
                  <p>
                    {product?.description ||
                      "A PENCILBOY release. Made in Lagos."}
                  </p>
                </div>
              )}
            </div>

            <div className="product-accordion">
              <button
                type="button"
                onClick={() =>
                  setSizeGuideOpen(
                    (value) =>
                      !value
                  )
                }
              >
                <span>
                  SIZE GUIDE
                </span>

                <ChevronDown
                  size={17}
                  className={
                    sizeGuideOpen
                      ? "open"
                      : ""
                  }
                />
              </button>

              {sizeGuideOpen && (
                <div className="product-accordion-content">
                  <p>
                    Select your usual
                    size. For a more
                    relaxed fit, we
                    recommend sizing
                    up.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}