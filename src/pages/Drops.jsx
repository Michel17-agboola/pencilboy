import { ArrowRight } from "lucide-react";
import PageIntro from "../components/PageIntro";
import ProductGrid from "../components/ProductGrid";

export default function Drops({ products, drops, onOpen, onSave, saved }) {
  return (
    <>
      <PageIntro eyebrow="RELEASES" title="DROPS">
        Drops are cultural releases — not seasonal collections. Each is a position, a moment, a mark.
      </PageIntro>

      <div className="drop-index">
        {drops.map((drop, i) => (
          <section className="drop-block" key={drop.id}>
            <div className="drop-number">
              <strong>{drop.number || String(i + 1).padStart(3, "0")}</strong>
              <span>AVAILABLE</span>
            </div>

            <div className="drop-content">
              <div className="drop-copy">
                <span className="eyebrow">DROP {drop.number || "001"}</span>
                <h2>{drop.name}</h2>
                <p>{drop.description}</p>
                <a className="text-link" href={`#/drops/${drop.slug || String(drop.name).toLowerCase().replace(/\s+/g, "-")}`}>
                  VIEW DROP <ArrowRight />
                </a>
              </div>
              <img src={drop.hero_image} alt={drop.name} />
            </div>
          </section>
        ))}
      </div>

      <section className="catalog-section">
        <div className="section-heading">
          <span className="eyebrow">SHOP</span>
          <h2>ITEMS</h2>
        </div>
        <ProductGrid products={products} onOpen={onOpen} onSave={onSave} saved={saved} />
      </section>
    </>
  );
}
