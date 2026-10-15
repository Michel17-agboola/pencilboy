import PageIntro from "../components/PageIntro";

const content = {
  terms: ["TERMS", "All purchases are subject to PENCILBOY terms of service. Product availability, pricing and release timing may change without notice."],
  privacy: ["PRIVACY", "We collect only the information needed to process purchases, maintain accounts and communicate with customers. We do not sell customer data."],
  returns: ["RETURNS", "14-day returns are available for unworn items with original tags. Sale items are final. Contact the studio before sending a return."]
};

export default function Policy({ type }) {
  const [title, text] = content[type] || content.terms;

  return (
    <>
      <PageIntro eyebrow="PENCILBOY" title={title} />
      <section className="policy-copy"><p>{text}</p></section>
    </>
  );
}
