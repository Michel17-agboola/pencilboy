export default function ProductCard({ product, onOpen, onSave, saved = [] }) {
  const image = Array.isArray(product.images) ? product.images[0] : product.image_url || product.image;
  const isSaved = saved.includes(product.id);
  const price = product.price !== undefined && product.price !== null
    ? `₦${Number(product.price).toLocaleString("en-NG")}`
    : "";

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <button className="product-image" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
          {image ? <img src={image} alt={product.name} loading="lazy" /> : <div className="image-placeholder" />}
        </button>
        {onSave && (
          <button className={`product-save ${isSaved ? "saved" : ""}`} onClick={() => onSave(product.id)} aria-label={isSaved ? `Remove ${product.name} from saved items` : `Save ${product.name}`}>
            {isSaved ? "♥" : "♡"}
          </button>
        )}
      </div>
      <div className="product-card-info">
        <button className="product-name" onClick={() => onOpen(product)}>{product.name}</button>
        {price && <span className="product-card-price">{price}</span>}
      </div>
    </article>
  );
}
