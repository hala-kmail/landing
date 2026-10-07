/**
 * 900-after - the page after the story: capabilities, FAQ, the last call, the footer.
 *
 * Markup only. Its motion is src/motion/chapters/900-after.js
 * and its styles src/styles/chapters/900-after.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
import OrapexLogo from '@/components/OrapexLogo'

export default function After() {
  return (
    <div className="after after-root" id="after">
      <section className="after-caps" aria-labelledby="after-caps-h">
        <header className="after-head">
          <div className="after-head-a">
            <p className="eyebrow after-eyebrow"><i className="after-eyedot" aria-hidden="true" />What else is inside</p>
            <h2 className="h2 after-h2 after-rise" id="after-caps-h">Everything in one assistant.</h2>
          </div>
          <p className="lead after-lead after-rise">The parts the story didn’t have time to show.</p>
        </header>
        <ul className="after-grid" role="list">
          <li className="after-card after-card-wide" style={{ '--i': '0' }}>
            <div className="after-card-main">
              <div className="after-card-top">
                <span className="after-mark" aria-hidden="true" />
                <span className="after-num" aria-hidden="true">01</span>
              </div>
              <h3 className="after-ct">Click any number, see the rows</h3>
              <p className="after-cd">Drill from any point on a chart to the records behind it — and read the exact SQL that found them.</p>
            </div>
            <div className="after-vig after-vig-rows" aria-hidden="true">
              <span className="after-vk">
                <span>Late orders › <b>Riyadh</b></span>
                <span>1,402 rows</span>
              </span>
              {' '}
              <span className="after-rrow" style={{ '--k': '0' }}>
                <span>SO-48213</span>
                <span>Nov 12 → Nov 15</span>
                <b>+3d</b>
              </span>
              {' '}
              <span className="after-rrow" style={{ '--k': '1' }}>
                <span>SO-48227</span>
                <span>Nov 12 → Nov 14</span>
                <b>+2d</b>
              </span>
              {' '}
              <span className="after-rrow" style={{ '--k': '2' }}>
                <span>SO-48240</span>
                <span>Nov 13 → Nov 19</span>
                <b>+6d</b>
              </span>
              {' '}
              <span className="after-rrow" style={{ '--k': '3' }}>
                <span>SO-48262</span>
                <span>Nov 14 → Nov 16</span>
                <b>+2d</b>
              </span>
            </div>
          </li>
          <li className="after-card" style={{ '--i': '1' }}>
            <div className="after-card-top">
              <span className="after-mark" aria-hidden="true" />
              <span className="after-num" aria-hidden="true">02</span>
              {' '}
              <svg className="after-ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6M10 22h4" />
              </svg>
            </div>
            <h3 className="after-ct">Insights, not just numbers</h3>
            <p className="after-cd">Not only what changed, but why it changed — with the evidence behind it.</p>
          </li>
          <li className="after-card" style={{ '--i': '2' }}>
            <div className="after-card-top">
              <span className="after-mark" aria-hidden="true" />
              <span className="after-num" aria-hidden="true">03</span>
              {' '}
              <svg className="after-ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14.5 2.5H6.2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11.6a2 2 0 0 0 2-2V7.8Z" />
                <path d="M14 2.7v4.1a1.2 1.2 0 0 0 1.2 1.2h4.4M8.3 12.5h7.4M8.3 16.5h5" />
              </svg>
            </div>
            <h3 className="after-ct">Documents too</h3>
            <p className="after-cd">Point Prism at your document library as well as your databases, and ask across both.</p>
          </li>
          <li className="after-card" style={{ '--i': '3' }}>
            <div className="after-card-top">
              <span className="after-mark" aria-hidden="true" />
              <span className="after-num" aria-hidden="true">04</span>
              {' '}
              <svg className="after-ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3 5 5.9v5.6c0 4.4 3 8.1 7 9.5 4-1.4 7-5.1 7-9.5V5.9Z" />
                <path d="m9 12.2 2.1 2.1 4-4.2" />
              </svg>
            </div>
            <h3 className="after-ct">Data reviews</h3>
            <p className="after-cd">Ask whether a dataset can be trusted before you build anything on it.</p>
          </li>
          <li className="after-card" style={{ '--i': '4' }}>
            <div className="after-card-top">
              <span className="after-mark" aria-hidden="true" />
              <span className="after-num" aria-hidden="true">05</span>
              {' '}
              <svg className="after-ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3.6 18.5a9.5 9.5 0 1 1 16.8 0" />
                <path d="m12 14.5 4.2-4.2" />
                <circle cx="12" cy="14.5" r="1.1" />
              </svg>
            </div>
            <h3 className="after-ct">Know what every answer costs</h3>
            <p className="after-cd">Every model call is priced and added up. Set a budget, and see how much is left.</p>
          </li>
          <li className="after-card after-card-wide" style={{ '--i': '5' }}>
            <div className="after-card-main">
              <div className="after-card-top">
                <span className="after-mark" aria-hidden="true" />
                <span className="after-num" aria-hidden="true">06</span>
              </div>
              <h3 className="after-ct">It tells you when not to trust a number</h3>
              <p className="after-cd">An open period, a balance that doesn’t match the ledger, a month with missing data: Prism says so before you act.</p>
            </div>
            <div className="after-vig after-vig-note" aria-hidden="true">
              <span className="after-vk">
                <span>Late orders · Q4</span>
                <span>Caveat</span>
              </span>
              {' '}
              <span className="after-vfig tnum" style={{ '--k': '0' }}>4,630</span>
              {' '}
              <span className="after-caveat" style={{ '--k': '1' }}><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.3v.2" /></svg>212 December deliveries aren’t confirmed yet — this figure may still change.</span>
            </div>
          </li>
        </ul>
      </section>
      <section className="after-faq" aria-labelledby="after-faq-h">
        <div className="after-faq-head after-rise">
          <p className="eyebrow after-eyebrow"><i className="after-eyedot" aria-hidden="true" />FAQ</p>
          <h2 className="h2 after-h2" id="after-faq-h">Questions, answered.</h2>
        </div>
        <div className="after-faq-list">
          <details className="after-qa after-rise" style={{ '--d': '0ms' }}>
            <summary className="after-qa-s">
              <h3 className="after-qa-q">Do I need to know SQL?</h3>
              <i className="after-qa-ico" aria-hidden="true" />
            </summary>
            <p className="after-qa-a">No. Ask in plain English or Arabic. Prism writes the SQL for you — and it’s always there if you want to read it.</p>
          </details>
          <details className="after-qa after-rise" style={{ '--d': '80ms' }}>
            <summary className="after-qa-s">
              <h3 className="after-qa-q">Which databases does Prism work with?</h3>
              <i className="after-qa-ico" aria-hidden="true" />
            </summary>
            <p className="after-qa-a">Oracle, SQL Server, PostgreSQL, MySQL and MongoDB — plus your document library.</p>
          </details>
          <details className="after-qa after-rise" style={{ '--d': '160ms' }}>
            <summary className="after-qa-s">
              <h3 className="after-qa-q">Can Prism change my data?</h3>
              <i className="after-qa-ico" aria-hidden="true" />
            </summary>
            <p className="after-qa-a">No. It connects through a read-only database user: it can read your data, never change it.</p>
          </details>
          <details className="after-qa after-rise" style={{ '--d': '240ms' }}>
            <summary className="after-qa-s">
              <h3 className="after-qa-q">What does it cost to run?</h3>
              <i className="after-qa-ico" aria-hidden="true" />
            </summary>
            <p className="after-qa-a">The usage page shows what every answer costs, and you can set a budget it will not exceed.</p>
          </details>
        </div>
      </section>
      <section className="after-ask" aria-labelledby="after-ask-h">
        <h2 className="after-ask-h after-rise" id="after-ask-h">Ask your first question in under a minute.</h2>
        {' '}
        {/* one link: the pill only looks like an input; anywhere on it opens the playground (nothing typed is sent) */}
        {' '}
        <a className="after-pill after-rise" href="https://demo.orapex.com/playground" rel="noopener">
          <span className="after-pill-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 4c.7 4.4 2.6 6.3 7 7-4.4.7-6.3 2.6-7 7-.7-4.4-2.6-6.3-7-7 4.4-.7 6.3-2.6 7-7Z" />
            </svg>
          </span>
          {' '}
          <span className="after-pill-text" aria-hidden="true">
            <span className="after-typed" dir="ltr">How did revenue compare to budget this year?</span>
            <i className="after-caret" />
          </span>
          {' '}
          <span className="btn primary after-try">Try it in the playground <span className="arrow" aria-hidden="true">↗</span></span>
        </a>
        {' '}
        <p className="after-note after-rise">Enter your email, pick a sample database, and see every number trace back to its source.</p>
      </section>
      <footer className="after-foot" role="contentinfo">
        <div className="after-foot-row">
          <a className="after-foot-brand" href="#top" aria-label="PRISM — back to the top">
            <span className="after-foot-wm" role="img" aria-label="PRISM" data-dot-home="" />
          </a>
          {' '}
          <nav className="after-foot-links" aria-label="Footer">
            <a href="https://demo.orapex.com/playground" rel="noopener">Playground</a>
            {' '}
            <a href="https://orapex.com" rel="noopener">orapex.com</a>
            {' '}
            <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
          </nav>
        </div>
        <div className="after-foot-row after-foot-fine">
          <p className="after-foot-by">An <OrapexLogo /> Product · Your all-in-one Enterprise AI Assistant.</p>
          <p className="after-foot-copy">KSA · UAE · USA · © 2026 ORAPEX</p>
        </div>
      </footer>
    </div>
  )
}
