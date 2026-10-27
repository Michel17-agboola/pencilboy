import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignIn({ navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = signup
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setError(result.error.message);
      } else {
        navigate("/account");
      }
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Unable to complete the request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">CUSTOMER</span>
        <h1>{signup ? "CREATE ACCOUNT" : "ACCOUNT"}</h1>
        <p>{signup ? "Create a PENCILBOY account to keep track of orders and saved items." : "Sign in to access your PENCILBOY account."}</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={submit}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          </label>

          <button className="add-bag" disabled={loading}>
            {loading ? "PLEASE WAIT…" : signup ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>
        </form>

        <button className="text-button" onClick={() => setSignup((v) => !v)}>
          {signup ? "Already have an account? Sign in" : "Need an account? Create one"}
        </button>
      </div>
    </section>
  );
}
