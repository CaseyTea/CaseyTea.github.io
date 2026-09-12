import { portfolioData as data } from '../data/portfolio'

const professionalProjects = data.projects.filter((project) => project.kind === 'professional')
const independentProjects = data.projects.filter((project) => ['pollyfwog', 'keebjournal'].includes(project.id))
const email = data.contacts.find((contact) => contact.label === 'Email')!

export function RecruiterPage() {
  return (
    <div className="recruiter-page">
      <a className="recruiter-skip" href="#main">Skip to content</a>
      <header className="recruiter-header recruiter-container">
        <a className="recruiter-wordmark" href="/recruiters/" aria-label="Casey Franceschy home">
          <span className="recruiter-monogram" aria-hidden="true">cf.</span>
          <span>Casey Franceschy</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#contact">Contact</a>
          <a className="recruiter-editor-link" href="/">Vim portfolio <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <main id="main">
        <section className="recruiter-hero recruiter-container" aria-labelledby="intro-title">
          <div className="recruiter-hero-copy">
            <p className="recruiter-eyebrow">Full-stack software engineer · Orange County, CA</p>
            <h1 id="intro-title">Complex data.<br /><span>Useful software.</span></h1>
            <p className="recruiter-lede">I build the web applications that help people get their work done.</p>
            <p className="recruiter-intro">At Irvine Unified School District, I turn HR data into employee workflows, reporting tools, and onboarding APIs. I work across the interface, business logic, database, and delivery pipeline.</p>
            <div className="recruiter-actions">
              <a className="recruiter-button recruiter-button--primary" href={data.resumeUrl} download>Download resume <span aria-hidden="true">↓</span></a>
              <a className="recruiter-button" href={email.href}>Let’s talk <span aria-hidden="true">↗</span></a>
            </div>
            <p className="recruiter-availability">Exploring full-stack software engineering opportunities.</p>
          </div>
          <aside className="recruiter-profile" aria-label="Professional focus">
            <div className="recruiter-profile-top"><span className="recruiter-eyebrow">A little about my work</span><span aria-hidden="true">01 / CF</span></div>
            <h2>Built around<br />real people.<br /><em>Backed by data.</em></h2>
            <ul>
              <li><span>01</span><div><strong>Business applications</strong><p>HR workflows, employee tools, and reports.</p></div></li>
              <li><span>02</span><div><strong>Connected systems</strong><p>Onboarding APIs and vendor data integrations.</p></div></li>
              <li><span>03</span><div><strong>Care in the details</strong><p>Permissions, audit history, and regression tests.</p></div></li>
            </ul>
            <div className="recruiter-profile-bottom"><span>C# / .NET / Blazor / SQL</span><span aria-hidden="true">{ }</span></div>
          </aside>
        </section>

        <div className="recruiter-proof-strip">
          <div className="recruiter-container">
            <p><strong>Irvine Unified</strong><span>HR applications & integrations</span></p>
            <p><strong>Apple</strong><span>Quality engineering internship</span></p>
            <p><strong>Independent builder</strong><span>Developer tools & native iOS</span></p>
          </div>
        </div>

        <section className="recruiter-section recruiter-container" id="work" aria-labelledby="work-title">
          <div className="recruiter-section-heading"><p className="recruiter-eyebrow">01 / Selected work</p><h2 id="work-title">Software with a job to do.</h2><p>Professional work for the teams managing employees, school operations, and the data between them.</p></div>
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
                    <summary>What I delivered</summary>
                    <ul className="recruiter-detail-list">{project.engineeringNotes?.map((note) => <li key={note}>{note}</li>)}</ul>
                  </details>
                </div>
              </article>
            ))}
          </div>
          <p className="recruiter-work-note">These applications were built for internal use at Irvine Unified School District.</p>
        </section>

        <section className="recruiter-experience-section" id="experience" aria-labelledby="experience-title">
          <div className="recruiter-container recruiter-experience-layout">
            <div className="recruiter-section-heading"><p className="recruiter-eyebrow">02 / Experience</p><h2 id="experience-title">Close to the code.<br />Close to the user.</h2><p>My background in technical support and quality engineering shapes how I build: understand the problem, trace the data, and make the result dependable.</p><a className="recruiter-text-link" href={data.resumeUrl} download>Get the full resume <span aria-hidden="true">↓</span></a></div>
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

        <section className="recruiter-section recruiter-container" aria-labelledby="projects-title">
          <div className="recruiter-section-heading"><p className="recruiter-eyebrow">03 / Beyond the day job</p><h2 id="projects-title">Curiosity, put to work.</h2><p>I also build tools I want to use, from a terminal workspace for coding assistants to an app for mechanical keyboard enthusiasts.</p></div>
          <div className="recruiter-project-grid">{independentProjects.map((project) => (
            <article className="recruiter-project" key={project.id}>
              <p className="recruiter-eyebrow">{project.status}</p><h3>{project.name}</h3><p className="recruiter-project-outcome">{project.outcome}</p><p>{project.contribution}</p>
              <ul className="recruiter-tags" aria-label={`${project.name} technologies`}>{project.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
              <a className="recruiter-text-link" href={`/#buffer=projects/${project.id}.md`}>Explore in the Vim portfolio <span aria-hidden="true">↗</span></a>
            </article>
          ))}</div>
        </section>

        <section className="recruiter-skills recruiter-container" aria-labelledby="skills-title">
          <p className="recruiter-eyebrow">04 / Toolkit</p><h2 id="skills-title">The tools behind the work.</h2>
          <div>{data.skillGroups.map((group) => <article key={group.title}><h3>{group.title}</h3><p>{group.skills.join(' · ')}</p></article>)}</div>
        </section>

        <section className="recruiter-contact" id="contact" aria-labelledby="contact-title">
          <div className="recruiter-container recruiter-contact-layout">
            <div><p className="recruiter-eyebrow">Let’s build something useful</p><h2 id="contact-title">Have a role in mind?</h2><p>I’m interested in full-stack work with room to own features, collaborate with users, and grow alongside a strong engineering team.</p><a className="recruiter-contact-email" href={email.href}>{email.href.replace('mailto:', '')}</a></div>
            <div className="recruiter-contact-links"><a className="recruiter-button recruiter-button--light" href={data.resumeUrl} download>Download resume <span aria-hidden="true">↓</span></a>{data.contacts.filter((contact) => contact.label !== 'Email').map((contact) => <a key={contact.label} href={contact.href} target="_blank" rel="noreferrer">{contact.label} <span aria-hidden="true">↗</span></a>)}</div>
          </div>
        </section>
      </main>

      <footer className="recruiter-footer recruiter-container"><p>Casey Franceschy · {data.location}</p><a href="/">Prefer Vim motions? There’s a portfolio for that. <span aria-hidden="true">↗</span></a></footer>
    </div>
  )
}
