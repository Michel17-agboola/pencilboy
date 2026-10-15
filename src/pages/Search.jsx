import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import PageIntro from "../components/PageIntro";
import ProductGrid from "../components/ProductGrid";

export default function Search({ products, onOpen, onSave, saved }) {
  const [query, setQuery] = useState("");

  const result = products.filter((p) =>
    `${p.name} ${p.category || ""}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <PageIntro eyebrow="SEARCH" title="FIND THE MARK" />

      <div className="search-box">
        <SearchIcon />
        <input
          autoFocus
          placeholder="Search items"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ProductGrid products={result} onOpen={onOpen} onSave={onSave} saved={saved} />
    </>
  );
}
