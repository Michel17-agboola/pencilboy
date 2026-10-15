import PageIntro from "../components/PageIntro";
import { useState } from "react";

export default function Lookbook({ entries }) {
  const filters = ["ALL", "PEOPLE", "STREET", "STUDIO", "NIGHT", "LAGOS", "COMMUNITY"];
  const [filter, setFilter] = useState("ALL");

  const visible = entries.filter(
    (x) => filter === "ALL" || x.category === filter || x.location === filter
  );

  return (
    <>
      <PageIntro eyebrow="PENCILBOY IN THE WORLD" title="LOOKBOOK">
        LOOKBOOK 001 — THE FIRST MARK — LAGOS / 2026
      </PageIntro>

      <div className="filter-row">
        {filters.map((x) => (
          <button key={x} className={filter === x ? "active" : ""} onClick={() => setFilter(x)}>
            {x}
          </button>
        ))}
      </div>

      <div className="lookbook-grid">
        {visible.map((x) => (
          <article className="lookbook-card" key={x.id}>
            <img src={x.image_url} alt={x.title} />
            <div>
              <span>{x.category} · {x.location}</span>
              <h3>{x.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
