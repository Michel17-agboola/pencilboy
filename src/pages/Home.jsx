export default function Home({ navigate }) {
  return (
    <div className="landing-page">
      <section className="landing-hero" aria-label="PENCILBOY introduction">
        <div className="landing-overlay" />

        <div className="landing-copy">
          <span className="landing-kicker">DROP 001 — LAGOS 2026</span>

          <h1>PENCILBOY</h1>

          <p>THE FIRST MARK</p>

          <button
            className="landing-enter"
            type="button"
            onClick={() => navigate("/shop")}
          >
            ENTER <span>→</span>
          </button>
        </div>

        <div className="landing-scroll">
          <span>SCROLL TO EXPLORE</span>
        </div>
      </section>
    </div>
  );
}