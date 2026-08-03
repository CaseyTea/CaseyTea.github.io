import { AppShell } from '../components/layout/AppShell'
import { portfolioData } from '../data/portfolio'

export function App() {
  return (
    <AppShell>
      <section className="intro-panel" id="about" aria-labelledby="about-heading">
        <p className="intro-panel__eyebrow">Hello, I’m Casey.</p>
        <h2 id="about-heading">{portfolioData.title}</h2>
        <p className="intro-panel__lede">{portfolioData.introduction}</p>

        <dl className="intro-panel__metrics" aria-label="Career highlights">
          {portfolioData.metrics.map(({ label, value }) => (
            <div key={label}>
              <dt>{value}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {portfolioData.navItems.slice(1).map(({ href }) => (
        <span className="section-anchor" id={href.slice(1)} key={href} aria-hidden="true" />
      ))}
    </AppShell>
  )
}
