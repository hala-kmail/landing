/**
 * 020-wait - a ticket, a queue, and nine days.
 *
 * Markup only. Its motion is src/motion/chapters/020-wait.js
 * and its styles src/styles/chapters/020-wait.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
export default function WaitChapter() {
  return (
    <section className="chapter" id="ch-wait" data-chapter="wait" data-len="1.65">
      <div className="stage wait-stage">
        <div className="wait-left">
          <div className="wait-copy">
            <p className="eyebrow wait-eyebrow">Monday · 09:12</p>
            <h2 className="h2 wait-head">
              <span className="wait-ph">But getting to them takes a&nbsp;ticket,</span>
              {' '}
              <span className="wait-ph">a queue,</span>
              {' '}
              <span className="wait-ph">and nine days.</span>
            </h2>
          </div>
          <div className="wait-clock" aria-hidden="true">
            <div className="wait-day">
              <span className="wait-day-k">Day</span>
              {' '}
              <span className="wait-reel-mask">
                <span className="wait-reel">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                  <span>9</span>
                </span>
              </span>
              {' '}
              <span className="wait-day-of">of waiting</span>
            </div>
            <ol className="wait-cal">
              <li className="wait-cell">
                <span className="wait-face wait-front">
                  <b>Mon</b>
                  <i>4</i>
                </span>
                <span className="wait-face wait-back">
                  <b>Mon</b>
                  <i>4</i>
                </span>
              </li>
              <li className="wait-cell">
                <span className="wait-face wait-front">
                  <b>Tue</b>
                  <i>5</i>
                </span>
                <span className="wait-face wait-back">
                  <b>Tue</b>
                  <i>5</i>
                </span>
              </li>
              <li className="wait-cell">
                <span className="wait-face wait-front">
                  <b>Wed</b>
                  <i>6</i>
                </span>
                <span className="wait-face wait-back">
                  <b>Wed</b>
                  <i>6</i>
                </span>
              </li>
              <li className="wait-cell">
                <span className="wait-face wait-front">
                  <b>Thu</b>
                  <i>7</i>
                </span>
                <span className="wait-face wait-back">
                  <b>Thu</b>
                  <i>7</i>
                </span>
              </li>
              <li className="wait-cell">
                <span className="wait-face wait-front">
                  <b>Fri</b>
                  <i>8</i>
                </span>
                <span className="wait-face wait-back">
                  <b>Fri</b>
                  <i>8</i>
                </span>
              </li>
              <li className="wait-cell is-weekend">
                <span className="wait-face wait-front">
                  <b>Sat</b>
                  <i>9</i>
                </span>
                <span className="wait-face wait-back">
                  <b>Sat</b>
                  <i>9</i>
                </span>
              </li>
              <li className="wait-cell is-weekend">
                <span className="wait-face wait-front">
                  <b>Sun</b>
                  <i>10</i>
                </span>
                <span className="wait-face wait-back">
                  <b>Sun</b>
                  <i>10</i>
                </span>
              </li>
              <li className="wait-cell">
                <span className="wait-face wait-front">
                  <b>Mon</b>
                  <i>11</i>
                </span>
                <span className="wait-face wait-back">
                  <b>Mon</b>
                  <i>11</i>
                </span>
              </li>
              <li className="wait-cell">
                <span className="wait-face wait-front">
                  <b>Tue</b>
                  <i>12</i>
                </span>
                <span className="wait-face wait-back">
                  <b>Tue</b>
                  <i>12</i>
                </span>
              </li>
            </ol>
          </div>
        </div>
        <div className="wait-right">
          <div className="wait-board">
            <i className="wait-bbg" aria-hidden="true" />
            {' '}
            <div className="wait-qhead" aria-hidden="true">
              <span className="wait-qtitle">Data &amp; Reporting <em>· Request queue</em></span>
              {' '}
              <span className="wait-qcount"><span className="wait-open">13</span> open</span>
            </div>
            <div className="wait-qbody">
              <ol className="wait-slots" aria-hidden="true">
                <li>1</li>
                <li>2</li>
                <li>3</li>
                <li>4</li>
                <li>5</li>
                <li>6</li>
                <li>7</li>
                <li>8</li>
                <li>9</li>
                <li>10</li>
                <li>11</li>
                <li>12</li>
                <li>13</li>
              </ol>
              <ol className="wait-rows" aria-hidden="true">
                <li className="wait-row">
                  <span className="wait-id">REQ-3088</span>
                  <span className="wait-title">Returns spike in March</span>
                  <span className="wait-st">
                    <i className="wait-pip" />
                    <span className="wait-stt">In progress</span>
                  </span>
                </li>
                <li className="wait-row">
                  <span className="wait-id">REQ-3091</span>
                  <span className="wait-title">Pipeline by region</span>
                  <span className="wait-st">
                    <i className="wait-pip" />
                    <span className="wait-stt">In queue</span>
                  </span>
                </li>
                <li className="wait-row">
                  <span className="wait-id">REQ-3094</span>
                  <span className="wait-title">Churn trend, 4 quarters</span>
                  <span className="wait-st">
                    <i className="wait-pip" />
                    <span className="wait-stt">In queue</span>
                  </span>
                </li>
                <li className="wait-row">
                  <span className="wait-id">REQ-3097</span>
                  <span className="wait-title">Supplier lead times</span>
                  <span className="wait-st">
                    <i className="wait-pip" />
                    <span className="wait-stt">In queue</span>
                  </span>
                </li>
                <li className="wait-row">
                  <span className="wait-id">REQ-3101</span>
                  <span className="wait-title">Budget vs. actual, Q3</span>
                  <span className="wait-st">
                    <i className="wait-pip" />
                    <span className="wait-stt">In queue</span>
                  </span>
                </li>
                <li className="wait-row">
                  <span className="wait-id">REQ-3104</span>
                  <span className="wait-title">Margin by product</span>
                  <span className="wait-st">
                    <i className="wait-pip" />
                    <span className="wait-stt">In queue</span>
                  </span>
                </li>
                <li className="wait-row">
                  <span className="wait-id">REQ-3106</span>
                  <span className="wait-title">Promotion results</span>
                  <span className="wait-st">
                    <i className="wait-pip" />
                    <span className="wait-stt">In queue</span>
                  </span>
                </li>
                <li className="wait-row">
                  <span className="wait-id">REQ-3109</span>
                  <span className="wait-title">Onboarding time</span>
                  <span className="wait-st">
                    <i className="wait-pip" />
                    <span className="wait-stt">In queue</span>
                  </span>
                </li>
                <li className="wait-row">
                  <span className="wait-id">REQ-3112</span>
                  <span className="wait-title">Lost deals by stage</span>
                  <span className="wait-st">
                    <i className="wait-pip" />
                    <span className="wait-stt">In queue</span>
                  </span>
                </li>
                <li className="wait-row">
                  <span className="wait-id">REQ-3115</span>
                  <span className="wait-title">Warehouse capacity</span>
                  <span className="wait-st">
                    <i className="wait-pip" />
                    <span className="wait-stt">In queue</span>
                  </span>
                </li>
                <li className="wait-row">
                  <span className="wait-id">REQ-3119</span>
                  <span className="wait-title">Top customers by revenue</span>
                  <span className="wait-st">
                    <i className="wait-pip" />
                    <span className="wait-stt">In queue</span>
                  </span>
                </li>
                <li className="wait-row">
                  <span className="wait-id">REQ-3124</span>
                  <span className="wait-title">Regional slowdown</span>
                  <span className="wait-st">
                    <i className="wait-pip" />
                    <span className="wait-stt">In queue</span>
                  </span>
                </li>
                <li className="wait-row is-ours">
                  <span className="wait-id">REQ-3127</span>
                  <span className="wait-title">Q4 Delivery Report</span>
                  <span className="wait-st">
                    <i className="wait-sock" />
                    <span className="wait-stt">In queue</span>
                  </span>
                </li>
              </ol>
              <div className="wait-nudgebox">
                <button type="button" className="wait-nudge" data-p="0.62">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  <span>Ask for an update</span>
                  <b className="wait-nudgen" aria-hidden="true" />
                </button>
                {' '}
                <p className="wait-reply" role="status" aria-live="polite" />
              </div>
            </div>
          </div>
          <article className="wait-ticket" aria-label="Request ticket REQ-3127">
            <div className="wait-tmain">
              <header className="wait-thead wait-tl">
                <span className="wait-tid">REQ-3127</span>
                <span className="wait-tname">Q4 Delivery Report</span>
              </header>
              <dl className="wait-fields">
                <div className="wait-f wait-f-wide wait-tl">
                  <dt>Request</dt>
                  <dd>Late orders last quarter</dd>
                </div>
                <div className="wait-f wait-tl">
                  <dt>Assigned to</dt>
                  <dd>Data &amp; Reporting</dd>
                </div>
                <div className="wait-f wait-tl">
                  <dt>Submitted</dt>
                  <dd>Mon, Jan 4 · 09:12</dd>
                </div>
              </dl>
              <footer className="wait-tstatus wait-tl">
                <span className="wait-tlabel">Status</span>
                <i className="wait-tsock" />
                <span className="wait-tstate">In queue</span>
              </footer>
            </div>
            <div className="wait-stub" aria-hidden="true">
              <span>Queue</span>
              <b>#13</b>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
