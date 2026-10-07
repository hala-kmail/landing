/**
 * 000-hero - the hero: the wordmark, the dot on its i, the promise.
 *
 * Markup only. Its motion is src/motion/chapters/000-hero.js
 * and its styles src/styles/chapters/000-hero.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
export default function HeroChapter() {
  return (
    <section className="chapter" id="ch-hero" data-chapter="hero" data-len="0.9">
      <div className="stage hero-stage">
        <div className="hero-col">
          <p className="eyebrow hero-eyebrow">Enterprise AI Assistant</p>
          <div className="hero-mark" role="img" aria-label="PRISM">
            <span className="hero-mark-fallback" aria-hidden="true" />
          </div>
          <h1 className="hero-h1">
            <span className="hero-m">
              <span className="hero-w">Answers</span>
            </span>
            {' '}
            <span className="hero-m">
              <span className="hero-w">you</span>
            </span>
            {' '}
            <span className="hero-m">
              <span className="hero-w">can</span>
            </span>
            {' '}
            <span className="hero-m">
              <span className="hero-w">check,</span>
            </span>
            {' '}
            <span className="hero-m">
              <span className="hero-w">not</span>
            </span>
            {' '}
            <span className="hero-m">
              <span className="hero-w">just</span>
            </span>
            {' '}
            <span className="hero-m">
              <span className="hero-w">answers.</span>
            </span>
          </h1>
          <p className="lead hero-lead">Ask your company data anything in plain language.<br className="hero-br" /> A team of AI agents queries it live and traces every number to its source.</p>
          <div className="hero-ctas">
            <a className="btn primary hero-cta" href="https://demo.orapex.com/playground" rel="noopener" data-p="0">Open the playground <span className="arrow" aria-hidden="true">→</span></a>
            {' '}
            <a className="btn hero-cta hero-ghost" href="#ch-questions" data-p="0" data-autoplay="">Watch how it thinks</a>
          </div>
          <p className="label hero-note">No sign-up. All you need is your email.</p>
        </div>
        <div className="hero-cue" aria-hidden="true">
          <span className="label hero-cue-label">Follow the dot</span>
          {' '}
          <i className="hero-cue-line">
            <b />
          </i>
        </div>
        <div className="hero-hint" aria-hidden="true">
          <svg className="hero-hint-arrow" viewBox="0 0 64 44" fill="none">
            <path className="hero-hint-curve" d="M60 34C46 40 22 38 9 15" pathLength="1" />
            <path className="hero-hint-head" d="M15.5 17.5L8.5 13.8 7.6 21.6" pathLength="1" />
          </svg>
          {' '}
          <span className="hero-hint-text">psst — you can grab me</span>
        </div>
      </div>
    </section>
  )
}
