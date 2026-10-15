import PageIntro from "../components/PageIntro";

export default function Contact() {
  return (
    <>
      <PageIntro eyebrow="CONTACT" title="GET IN TOUCH" />

      <section className="contact-grid">
        <div>
          <span className="eyebrow">STUDIO</span>
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
      </section>
    </>
  );
}
