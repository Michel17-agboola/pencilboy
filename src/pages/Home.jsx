import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "pencilboy_newsletter_subscribed";

export default function Home({ navigate }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const alreadySubscribed =
      localStorage.getItem(STORAGE_KEY) === "true";

    if (alreadySubscribed) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPopupOpen(true);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!popupOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [popupOpen]);

  const closePopup = () => {
    if (submitting) return;

    setPopupOpen(false);
    setMessage("");
  };

  const handleSubscribe = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) return;

    setSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: normalizedEmail,
        });

      /*
       * A duplicate email is still considered subscribed.
       * PostgreSQL unique violation = 23505.
       */
      if (error && error.code !== "23505") {
        throw error;
      }

      localStorage.setItem(STORAGE_KEY, "true");

      setMessage("YOU'RE IN.");
      setEmail("");

      window.setTimeout(() => {
        setPopupOpen(false);
        setMessage("");
      }, 900);
    } catch (error) {
      console.error(
        "PNCHE newsletter subscription failed:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="landing-page">
      <section
        className="landing-hero"
        aria-label="PNCHE"
      >
        <div className="landing-overlay" />

        <div className="landing-copy">
        
          <button
            className="landing-enter"
            type="button"
            onClick={() => navigate("/shop")}
          >
            ENTER
            <span>→</span>
          </button>
        </div>

        {popupOpen && (
          <div
            className="newsletter-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-title"
          >
            <button
              type="button"
              className="newsletter-modal-close"
              onClick={closePopup}
              aria-label="Close newsletter"
              disabled={submitting}
            >
              <X
                size={20}
                strokeWidth={1.4}
              />
            </button>

            <div className="newsletter-modal-content">
              <span className="newsletter-modal-eyebrow">
                PNCHE
              </span>

              <h2 id="newsletter-title">
                RECEIVE WEBSITE
                <br />
                UPDATES
              </h2>

              <p>
                Be the first to know about new
                drops, exclusive releases,
                collaborations and more.
              </p>

              <form
                className="newsletter-modal-form"
                onSubmit={handleSubscribe}
              >
                <label
                  htmlFor="newsletter-email"
                >
                  EMAIL ADDRESS
                </label>

                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="ENTER YOUR EMAIL"
                  autoComplete="email"
                  required
                  disabled={submitting}
                />

                <button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "SUBSCRIBING..."
                    : "SUBSCRIBE"}
                </button>
              </form>

              <small>
                By subscribing, you agree to receive
                updates from PNCHE. You can unsubscribe
                at any time.
              </small>

              {message && (
                <div
                  className={`newsletter-modal-message ${
                    message === "YOU'RE IN."
                      ? "success"
                      : "error"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}