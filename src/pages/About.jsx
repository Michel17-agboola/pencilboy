export default function About() {
  return (
    <>
      <section className="about-hero">
        <img
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2000&q=90"
          alt="PENCILBOY"
        />
        <div>
          <span className="eyebrow">ABOUT</span>
          <h1>WHO IS<br />PENCILBOY?</h1>
        </div>
      </section>

      <section className="about-copy">
        <span className="eyebrow">THE MARK</span>
        <h2>PENCILBOY IS A CULTURAL BRAND FROM LAGOS.</h2>
        <p>
          We make clothing, but the clothes are only one part of the language. The rest lives in people, music,
          photography, nights, streets, collaborations and the communities that shape the mark.
        </p>
      </section>
    </>
  );
}
