import { useState } from "react";

export default function Home({ navigate }) {
  const [subscribed, setSubscribed] = useState(() => {
    return (
      localStorage.getItem("pencilboy_newsletter_subscribed") === "true"
    );
  });

  const [email, setEmail] = useState("");

  const handleSubscribe = (event) => {
    event.preventDefault();

    if (!email.trim()) return;

    localStorage.setItem(
      "pencilboy_newsletter_subscribed",
      "true"
    );

    setSubscribed(true);
  };

  return (
    <div className="landing-page">
      <section
        className="landing-hero"
        aria-label="PENCILBOY"
      >
        <div className="landing-overlay" />

        {!subscribed ? (
          <div className="landing-newsletter">
            <span className="landing-newsletter-eyebrow">
              PENCILBOY
            </span>

            <h1>SUBSCRIBE TO OUR NEWSLETTER</h1>

            <p>
              Be the first to know about new drops,
              exclusive releases, collaborations and more.
            </p>

            <form
              className="landing-newsletter-form"
              onSubmit={handleSubscribe}
            >
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ENTER YOUR EMAIL"
                required
              />

              <button type="submit">
                SUBSCRIBE →
              </button>
            </form>
          </div>
        ) : (
          <div className="landing-copy">
            <button
              className="landing-enter"
              type="button"
              onClick={() => navigate("/shop")}
            >
              ENTER <span>→</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}