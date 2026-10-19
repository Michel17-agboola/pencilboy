import ProductCard from "./ProductCard";

export default function ProductGrid({
  products = [],
  onOpen,
  onSave,
  saved = [],
  loading = false,
}) {
  if (loading) {
    return (
      <div
        className="product-grid product-grid-loading"
        aria-label="Loading products"
        aria-busy="true"
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="product-skeleton-card"
            key={index}
          >
            <div className="product-skeleton-image" />

            <div className="product-skeleton-info">
              <span />
              <span />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="empty-block">
        <span className="eyebrow">PNCHE</span>
        <p>No items available.</p>
      </div>
    );
  }

  return (
    <div
      className={`product-grid ${
        isNewIn
          ? "product-grid-new-in"
          : "product-grid-category"
      }`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onOpen={onOpen}
          onSave={onSave}
          saved={saved}
        />
      ))}
    </div>
  );
}