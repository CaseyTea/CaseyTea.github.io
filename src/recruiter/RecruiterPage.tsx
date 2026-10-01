import { portfolioData as data } from '../data/portfolio'

const professionalProjects = data.projects.filter((project) => project.kind === 'professional')
const independentProjects = data.projects.filter((project) => ['pollyfwog', 'keebjournal', 'twitch-chat-overlay'].includes(project.id))
const email = data.contacts.find((contact) => contact.label === 'Email')!

export function RecruiterPage() {
  return (
    <div className="recruiter-page" id="top">
      <a className="recruiter-skip" href="#main">Skip to content</a>
      <header className="recruiter-header recruiter-container">
        <a className="recruiter-wordmark" href="/recruiters/" aria-label="Casey Franceschy home">
          <span className="recruiter-monogram" aria-hidden="true">cf.</span>
          <span>Casey Franceschy</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
          <a className="recruiter-editor-link" href="/">Vim portfolio <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <main id="main">
        <section className="recruiter-hero recruiter-container" aria-labelledby="intro-title">
          <div className="recruiter-hero-copy">
            <p className="recruiter-eyebrow">Full-stack software engineer · Orange County, CA</p>
            <h1 id="intro-title">Full-stack engineering.<br /><span>From data to delivery.</span></h1>
            <p className="recruiter-lede">I’m Casey. I build HR web applications, onboarding APIs, and the integrations that connect them.</p>
            <p className="recruiter-intro">At Irvine Unified School District, my work spans the database, business rules, user interface, and release pipeline. My core stack is C#, .NET, Blazor, and SQL Server.</p>
            <div className="recruiter-actions">
              <a className="recruiter-button recruiter-button--primary" href={data.resumeUrl} download>Download resume <span aria-hidden="true">↓</span></a>
              <a className="recruiter-button" href={email.href}>Email Casey <span aria-hidden="true">↗</span></a>
            </div>
            <p className="recruiter-availability">Exploring full-stack software engineering opportunities.</p>
          </div>
          <aside className="recruiter-profile" aria-label="Professional focus">
            <div className="recruiter-profile-top"><span className="recruiter-eyebrow">What I bring to a team</span><span aria-hidden="true">01 / CF</span></div>
            <h2>The workflow.<br />The data.<br /><em>The details that matter.</em></h2>
            <ul>
              <li><span>01</span><div><strong>Application development</strong><p>Employee search, evaluation workflows, and reporting.</p></div></li>
              <li><span>02</span><div><strong>APIs and integrations</strong><p>Account onboarding, SQL exports, and vendor feeds.</p></div></li>
              <li><span>03</span><div><strong>Maintainable delivery</strong><p>Scoped permissions, audit trails, tests, and release pipelines.</p></div></li>
            </ul>
            <div className="recruiter-profile-bottom"><span>C# / .NET / Blazor / SQL</span><span aria-hidden="true">{ }</span></div>
          </aside>
        </section>

        <div className="recruiter-proof-strip">
          <div className="recruiter-container">
            <p><strong>Irvine Unified</strong><span>HR applications & integrations</span></p>
            <p><strong>Apple</strong><span>Quality engineering internship</span></p>
            <p><strong>Independent projects</strong><span>Developer tools, Windows & iOS</span></p>
          </div>
        </div>

        <section className="recruiter-section recruiter-container" id="work" aria-labelledby="work-title">
          <div className="recruiter-section-heading"><p className="recruiter-eyebrow">01 / Selected work</p><h2 id="work-title">What I build at work.</h2><p>Applications and integrations for HR teams and school administrators. Here’s what each system does and where I contributed.</p></div>
          <div className="recruiter-work-list">
            {professionalProjects.map((project, index) => (
              <article className="recruiter-work" key={project.id}>
                <div className="recruiter-work-label"><span className="recruiter-work-number">0{index + 1}</span><p>IRVINE UNIFIED<br />SCHOOL DISTRICT</p></div>
                <div className="recruiter-work-body">
                  <h3>{project.name}</h3>
                  <p className="recruiter-work-outcome">{project.outcome}</p>
                  <p>{project.contribution}</p>
                  <ul className="recruiter-tags" aria-label={`${project.name} technologies`}>{project.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
                  <details>
                    <summary>Implementation details<span className="recruiter-sr-only">: {project.name}</span></summary>
                    <p className="recruiter-project-context">{project.context}</p>
                    <ul className="recruiter-detail-list">{project.engineeringNotes?.map((note) => <li key={note}>{note}</li>)}</ul>
                  </details>
                </div>
              </article>
            ))}
          </div>
          <p className="recruiter-work-note">This work belongs to Irvine Unified School District. These summaries describe my contributions to internal systems.</p>
        </section>

        <section className="recruiter-experience-section" id="experience" aria-labelledby="experience-title">
          <div className="recruiter-container recruiter-experience-layout">
            <div className="recruiter-section-heading"><p className="recruiter-eyebrow">02 / Experience</p><h2 id="experience-title">Engineering with a<br />support and quality mindset.</h2><p>I moved from district technology support into full-time programming in July 2024. Earlier, I worked on bug triage and tooling as a quality engineering intern at Apple.</p><a className="recruiter-text-link" href={data.resumeUrl} download>Download resume <span aria-hidden="true">↓</span></a></div>
            <div className="recruiter-timeline">
              {data.experience.map((experience) => (
                <article key={experience.id}>
                  <p className="recruiter-dates">{experience.dates}</p>
                  <h3>{experience.title}</h3>
                  <p className="recruiter-organization">{experience.organization}</p>
                  <p>{experience.summary}</p>
                  <ul>{experience.highlights.slice(0, experience.id === 'analyst-programmer' ? 3 : 2).map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
                </article>
              ))}
              <div className="recruiter-education"><p className="recruiter-eyebrow">Education</p><h3>B.S. in Computer Science</h3><p>California State University, Fullerton · December 2022</p></div>
            </div>
          </div>
        </section>

        <section className="recruiter-section recruiter-container" id="projects" aria-labelledby="projects-title">
          <div className="recruiter-section-heading"><p className="recruiter-eyebrow">03 / Independent projects</p><h2 id="projects-title">Tools I wanted to exist.</h2><p>A terminal app for coding assistants, a mechanical keyboard journal, and a Twitch chat overlay. Each gives me a different problem to solve beyond web applications.</p></div>
          <div className="recruiter-project-grid">{independentProjects.map((project) => (
            <article className="recruiter-project" key={project.id}>
              <p className="recruiter-eyebrow">{project.status}</p><h3>{project.name}</h3><p className="recruiter-project-outcome">{project.outcome}</p><p>{project.contribution}</p>
              <ul className="recruiter-tags" aria-label={`${project.name} technologies`}>{project.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
              <details>
                <summary>Engineering details<span className="recruiter-sr-only">: {project.name}</span></summary>
                <ul className="recruiter-detail-list">{project.engineeringNotes?.map((note) => <li key={note}>{note}</li>)}</ul>
              </details>
              <a className="recruiter-text-link" href={`/#buffer=projects/${project.id}.md`}>Open in Vim portfolio<span className="recruiter-sr-only">: {project.name}</span> <span aria-hidden="true">↗</span></a>
            </article>
          ))}</div>
        </section>

        <section className="recruiter-skills recruiter-container" aria-labelledby="skills-title">
          <p className="recruiter-eyebrow">04 / Technical skills</p><h2 id="skills-title">My working stack.</h2>
          <div>{data.skillGroups.map((group) => <article key={group.title}><h3>{group.title}</h3><p>{group.skills.join(' · ')}</p></article>)}</div>
        </section>

        <section className="recruiter-contact" id="contact" aria-labelledby="contact-title">
          <div className="recruiter-container recruiter-contact-layout">
            <div><p className="recruiter-eyebrow">Open to full-stack opportunities</p><h2 id="contact-title">Let’s talk about your team.</h2><p>{data.availability}</p><a className="recruiter-contact-email" href={email.href}>{email.href.replace('mailto:', '')}</a></div>
            <div className="recruiter-contact-links"><a className="recruiter-button recruiter-button--light" href={data.resumeUrl} download>Download resume <span aria-hidden="true">↓</span></a>{data.contacts.filter((contact) => contact.label !== 'Email').map((contact) => <a key={contact.label} href={contact.href} target="_blank" rel="noreferrer">{contact.label} <span aria-hidden="true">↗</span></a>)}</div>
          </div>
        </section>
      </main>

      <footer className="recruiter-footer recruiter-container"><p>Casey Franceschy · {data.location}</p><a href="/">Explore the Vim portfolio <span aria-hidden="true">↗</span></a><a href="#top">Back to top ↑</a></footer>
    </div>
  )
}
