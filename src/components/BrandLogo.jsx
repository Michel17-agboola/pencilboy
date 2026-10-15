export default function BrandLogo({ className = "" }) {
  return (
    <a
      href="#/"
      className={`brand-logo ${className}`}
      aria-label="PENCILBOY. home"
    >
      <img
        src="/logo.png"
        alt="PENCILBOY."
        className="brand-logo-image"
      />
    </a>
  );
}