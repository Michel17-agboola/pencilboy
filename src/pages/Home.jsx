import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home({ navigate }) {
  const [subscribed, setSubscribed] = useState(() => {
    return (
      localStorage.getItem(
        "pencilboy_newsletter_subscribed"
      ) === "true"
    );
  });

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (event) => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) return;

    setLoading(true);
    setError("");

    const { error: subscribeError } =
      await supabase.rpc(
        "subscribe_to_newsletter",
        {
          p_email: cleanEmail,
        }
      );

    if (subscribeError) {
      console.error(
        "PENCILBOY newsletter subscription error:",
        subscribeError
      );

      setError(
        "Something went wrong. Please try again."
      );

      setLoading(false);
      return;
    }

    /*
     * Remember the subscription on this device
     * so the newsletter gate does not appear again.
     */
    localStorage.setItem(
      "pencilboy_newsletter_subscribed",
      "true"
    );

    setSubscribed(true);
    setEmail("");
    setLoading(false);
  };

  return (
    <div className="landing-page">
      <section
        className="landing-hero"
        aria-label="PENCILBOY"
      >
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

            <h1>
              SUBSCRIBE TO OUR NEWSLETTER
            </h1>

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
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="ENTER YOUR EMAIL"
                autoComplete="email"
                required
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "SUBSCRIBING..."
                  : "SUBSCRIBE →"}
              </button>
            </form>

            {error && (
              <div className="landing-newsletter-error">
                {error}
              </div>
            )}
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