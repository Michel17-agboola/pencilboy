export default function NotFound({ navigate }) {
  return (
    <main className="empty-block not-found-page">
      <span className="eyebrow">PENCILBOY</span>
      <h1>PAGE NOT FOUND</h1>
      <p>The page you are looking for does not exist.</p>
      <button
        type="button"
        className="landing-enter"
        onClick={() => navigate("/")}
      >
        BACK HOME
      </button>
    </main>
  );
}
