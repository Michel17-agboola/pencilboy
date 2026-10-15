import { ArrowRight } from "lucide-react";
import PageIntro from "../components/PageIntro";

export default function World({ stories }) {
  return (
    <>
      <PageIntro eyebrow="BEYOND CLOTHING" title="WORLD">
        PENCILBOY is not just clothing. It is campaigns, stories, collaborations, music, culture, and events.
      </PageIntro>

      <section className="stories-section">
        <span className="eyebrow">STORIES</span>

        <div className="stories-grid">
          {stories.map((story) => (
            <article key={story.id}>
              <img src={story.cover_image} alt={story.title} />
              <div>
                <span>{story.category}</span>
                <h2>{story.title}</h2>
                <p>{story.excerpt}</p>
                <a href={`#/world/${story.slug || story.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  READ STORY <ArrowRight />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
