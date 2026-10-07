import ThemeToggle from '@/components/ThemeToggle'

/** The top bar. core.js marks <html> .is-scrolled once the story has moved; base.css styles it from there. */
export default function Nav() {
  return (
    <header className="nav">
      <a className="nav-brand" href="#top" aria-label="PRISM — back to the top">
        <span className="nav-wordmark" role="img" aria-label="PRISM" />
      </a>
      <nav className="nav-links" aria-label="Primary">
        <a href="#ch-questions">The story</a>
        <a href="#ch-asks">How it works</a>
        <a href="#ch-hands">Security</a>
        <ThemeToggle />
        <a className="btn primary" href="https://demo.orapex.com/playground" rel="noopener">
          Open the playground
        </a>
      </nav>
    </header>
  )
}
