export function AboutSection() {
  return (
    <section
      className="portfolio-section about-section"
      id="about"
      aria-labelledby="about-heading"
      tabIndex={-1}
    >
      <div className="section-heading">
        <p className="section-eyebrow">Away from the ticket queue</p>
        <h2 id="about-heading">About me</h2>
      </div>

      <div className="about-section__copy">
        <p>
          I’m Casey. Outside of work, I build and mod mechanical keyboards, spend plenty of time in
          Neovim using Vim motions, and get together with friends for code jams.
        </p>
        <p>
          I have a soft spot for frogs and for learning through playful projects—the kind of small,
          curious builds that make a new API or tool click. That same curiosity follows me into
          professional work: understand the real problem, keep the solution practical, and leave the
          system better than I found it.
        </p>
      </div>
    </section>
  )
}
