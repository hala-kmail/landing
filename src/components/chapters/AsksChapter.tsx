/**
 * 060-asks - it doesn’t guess, it asks.
 *
 * Markup only. Its motion is src/motion/chapters/060-asks.js
 * and its styles src/styles/chapters/060-asks.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
export default function AsksChapter() {
  return (
    <section className="chapter" id="ch-asks" data-chapter="asks" data-len="2.25">
      <div className="stage asks-stage">
        <div className="asks-frame">
          <div className="asks-copy">
            <h2 className="h2 asks-h">
              <span className="asks-hm">
                <span className="asks-hl">It doesn’t guess.</span>
              </span>
              {' '}
              <span className="asks-hm">
                <span className="asks-hl asks-hl2">It asks.</span>
              </span>
            </h2>
            <p className="lead asks-lead">When a question could mean two things, Prism works out every reading&nbsp;— then asks, with the numbers side&nbsp;by&nbsp;side.</p>
          </div>
          <div className="asks-card">
            <div className="asks-shadow" aria-hidden="true" />
            <div className="asks-body card" role="group" aria-label="A Prism thread">
              <header className="asks-head">
                <span className="asks-status" aria-hidden="true">
                  <i className="asks-idle" />
                  {' '}
                  <svg className="asks-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </span>
                {' '}
                <span className="asks-title">
                  <b>Thread</b>
                  {' '}
                  <span className="asks-src"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" /></svg>ops_db · PostgreSQL</span>
                </span>
                {' '}
                <span className="asks-when">MON 09:12</span>
              </header>
              <p className="asks-empty">Nothing has been said in this session yet.</p>
              <div className="asks-scroll">
                <div className="asks-tx">
                  <div className="asks-you">
                    <p className="asks-bubble"><span className="sr-only">You: </span>How many orders arrived late last quarter?</p>
                  </div>
                  <div className="asks-agent">
                    <p className="asks-meta asks-agents">AGENTS</p>
                    <div className="asks-work">
                      <p className="asks-meta asks-think-h"><span className="asks-slot" aria-hidden="true"><i className="asks-slot-pip" /></span>THINKING</p>
                      <p className="asks-think asks-t1">Reading <code>orders</code> and <code>deliveries</code></p>
                      <p className="asks-think asks-t2">“Late” can be read three ways here, so I counted each one.</p>
                    </div>
                  </div>
                  <div className="asks-answer" aria-live="polite" aria-atomic="true">
                    <div className="asks-ans-in">
                      <svg className="asks-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle className="asks-check-c" cx="12" cy="12" r="10" pathLength="1" />
                        <path className="asks-check-t" d="m8.2 12.3 2.6 2.6 5-5.4" pathLength="1" />
                      </svg>
                      {' '}
                      <div className="asks-ans-body">
                        <p className="asks-ans-text">
                          <b className="asks-ans-n tnum">4,630</b>
                          {' '}
                          <span className="asks-ans-rest">orders arrived after the date the customer asked for.</span>
                        </p>
                        <p className="asks-ans-meta">Counted as · <span className="asks-ans-read">after the requested date</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="asks-composer" aria-hidden="true">
                <div className="asks-box">
                  <p className="asks-input">
                    <span className="asks-typed">How many orders arrived late last quarter?</span>
                    <span className="asks-ph">Ask anything about your data</span>
                    <i className="asks-caret" />
                  </p>
                  <div className="asks-tools">
                    <span className="asks-tool">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                    </span>
                    {' '}
                    <span className="asks-send">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 12 7-7 7 7" />
                        <path d="M12 19V5" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div className="asks-form">
                <div className="asks-form-top">
                  <p className="asks-meta asks-need"><span className="asks-pip" aria-hidden="true"><i className="asks-slot-pip asks-pip-ring" /></span>THE AGENTS NEED YOU</p>
                  <p className="asks-meta asks-left">1 left to answer</p>
                </div>
                <p className="asks-legend" id="asks-legend">Before I count — what does “late” mean for you?</p>
                <div className="asks-opts" role="radiogroup" aria-labelledby="asks-legend">
                  <button type="button" role="radio" className="asks-opt" data-k="requested" data-p="0.6" aria-checked="true" aria-label="After the requested date: 4,630">
                    <span className="asks-radio" aria-hidden="true" />
                    <span className="asks-opt-l">After the requested date</span>
                    <span className="asks-opt-n tnum" data-n="4630" aria-hidden="true">4,630</span>
                  </button>
                  {' '}
                  <button type="button" role="radio" className="asks-opt" data-k="promised" data-p="0.6" aria-checked="false" aria-label="After the promised date: 1,180">
                    <span className="asks-radio" aria-hidden="true" />
                    <span className="asks-opt-l">After the promised date</span>
                    <span className="asks-opt-n tnum" data-n="1180" aria-hidden="true">1,180</span>
                  </button>
                  {' '}
                  <button type="button" role="radio" className="asks-opt" data-k="transit" data-p="0.6" aria-checked="false" aria-label="Over 48 hours in transit: 2,215">
                    <span className="asks-radio" aria-hidden="true" />
                    <span className="asks-opt-l">Over 48 hours in transit</span>
                    <span className="asks-opt-n tnum" data-n="2215" aria-hidden="true">2,215</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="chapter-label label asks-label"><b>01</b> Asks when it matters</div>
      </div>
    </section>
  )
}
