/**
 * 110-finale - home again: the wordmark and the end card.
 *
 * Markup only. Its motion is src/motion/chapters/110-finale.js
 * and its styles src/styles/chapters/110-finale.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
import OrapexLogo from '@/components/OrapexLogo'

export default function FinaleChapter() {
  return (
    <section className="chapter" id="ch-finale" data-chapter="finale" data-len="1.65">
      <div className="stage finale-stage">
        <div className="finale-lock">
          <h2 className="finale-title">
            <span className="finale-wm" aria-hidden="true">
              <span className="finale-guide finale-guide-cap" />
              {' '}
              <span className="finale-guide finale-guide-base" />
              {' '}
              <span className="finale-wm-static" />
            </span>
            {' '}
            <span className="sr-only">Prism. </span>
            {' '}
            <span className="finale-tag">
              <span className="finale-mask">
                <span className="finale-line finale-line-a">Your all-in-one</span>
              </span>
              {' '}
              <span className="finale-mask">
                <span className="finale-line finale-line-b">Enterprise AI Assistant.</span>
              </span>
            </span>
          </h2>
          <p className="lead finale-lead">Bring your own question, and watch how it thinks.</p>
          <div className="finale-ctas">
            <a className="btn primary finale-cta finale-go" href="https://demo.orapex.com/playground" rel="noopener" data-p="0.96">Open the playground <span className="arrow" aria-hidden="true">→</span></a>
            {' '}
            <a className="btn finale-cta finale-cta-ghost" href="https://orapex.com" rel="noopener" data-p="0.96">Visit orapex.com</a>
          </div>
        </div>
        <p className="finale-by">
          <span className="finale-by-word">An</span>
          {' '}
          <OrapexLogo className="finale-by-logo" />
          {' '}
          <span className="finale-by-word">Product</span>
        </p>
      </div>
    </section>
  )
}
