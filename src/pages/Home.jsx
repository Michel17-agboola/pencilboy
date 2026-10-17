export default function Home({ navigate }) {
  return (
    <div className="landing-page">
      <section
        className="landing-hero"
        aria-label="PENCILBOY"
      >
        <div className="landing-overlay" />

        <div className="landing-copy">
          <button
            className="landing-enter"
            type="button"
            onClick={() => navigate("/shop")}
          >
            ENTER <span>→</span>
          </button>
        </div>
      </section>
    </div>
  );
}