export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <span className="eyebrow">CONTACT</span>
          <h2>GET IN TOUCH</h2>
          <a href="mailto:studio@pencilboy.world">STUDIO@PENCILBOY.WORLD</a>
          <p>+234 · LAGOS, NIGERIA</p>
          <p>MON–FRI · 10:00–18:00 WAT</p>
        </div>

        <div>
          <span className="eyebrow">SHIPPING</span>
          <p>Ships within 3–5 business days from Lagos.<br />Free over ₦150,000.</p>
        </div>

        <div>
          <span className="eyebrow">RETURNS</span>
          <p>14-day returns on unworn items with tags.<br />Sale items final.</p>
        </div>

        <div>
          <span className="eyebrow">PRIVACY</span>
          <p>We keep your data minimal and never sell it.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <strong>PENCILBOY CORPORATE</strong>
        <div>
          <a href="#/contact">CONTACT</a>
          <a href="#/terms">TERMS</a>
          <a href="#/privacy">PRIVACY</a>
          <a href="#/account">ORDER STATUS</a>
        </div>
        <span>© 2026 PENCILBOY</span>
      </div>
    </footer>
  );
}
