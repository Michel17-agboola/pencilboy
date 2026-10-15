import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [], onOpen, onSave, saved = [] }) {
  if (!products.length) {
    return (
      <div className="empty-block">
        <span className="eyebrow">PENCILBOY</span>
        <p>No items available.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onOpen={onOpen} onSave={onSave} saved={saved} />
      ))}
    </div>
  );
}
