import ProductCard from "./ProductCard";

export default function ProductGrid({
  products = [],
  onOpen,
  onSave,
  saved = [],
  loading = false,
  isNewIn = false,
}) {
  if (loading) {
    return (
      <div className="empty-block">
        <span className="eyebrow">PENCILBOY</span>
        <p>Loading...</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="empty-block">
        <span className="eyebrow">PENCILBOY</span>
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