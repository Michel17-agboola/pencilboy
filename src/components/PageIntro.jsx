import { RefreshCw } from "lucide-react";

export default function PageIntro({ eyebrow, title, children, onRefresh }) {
  const refreshPage = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    window.location.reload();
  };

  return (
    <section className="page-intro">
      <div className="page-intro-top">
        <span className="eyebrow">{eyebrow}</span>
        <button className="page-refresh" onClick={refreshPage} aria-label={`Refresh ${title}`} title="Refresh">
          <RefreshCw size={16} strokeWidth={1.5} />
          <span>REFRESH</span>
        </button>
      </div>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </section>
  );
}
