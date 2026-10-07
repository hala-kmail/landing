/**
 * 030-number - the report comes back, and the year is built on its number.
 *
 * Markup only. Its motion is src/motion/chapters/030-number.js
 * and its styles src/styles/chapters/030-number.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
export default function NumberChapter() {
  return (
    <section className="chapter" id="ch-number" data-chapter="number" data-len="2.7">
      <div className="stage number-stage">
        <div className="wait-left number-left">
          <div className="number-copy">
            <h2 className="h2 number-h number-h1">Nine days later, the&nbsp;report came&nbsp;back.</h2>
            <p className="h2 number-h number-h2">So the year’s plan was built on&nbsp;it.</p>
          </div>
        </div>
        <div className="wait-right number-right">
          <div className="wait-board number-board">
            <i className="wait-bbg" aria-hidden="true" />
            {' '}
            <div className="wait-qhead" aria-hidden="true">
              <span className="wait-qtitle">Data &amp; Reporting <em>· Request queue</em></span>
              {' '}
              <span className="wait-qcount">1 open</span>
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
                <li className="wait-row is-ours" data-s="done">
                  <span className="wait-id">REQ-3127</span>
                  <span className="wait-title">Q4 Delivery Report</span>
                  <span className="wait-st">
                    <i className="wait-sock" />
                    <span className="wait-stt">Resolved</span>
                  </span>
                </li>
              </ol>
              <article className="number-report" aria-label="Q4 Delivery Report">
                <header className="number-rhead number-rl">
                  <div>
                    <p className="number-rtitle">Q4 Delivery Report</p>
                    <p className="number-rmeta">Data &amp; Reporting · REQ-3127 · Tue, Jan 12</p>
                  </div>
                  {' '}
                  <span className="number-rpage">Page 1 of 1</span>
                </header>
                <div className="number-rkpis number-rl">
                  <div className="number-kpi">
                    <span className="number-klabel">Late orders · Q4</span>
                    {' '}
                    <span className="number-kslot">
                      <span className="sr-only">1,180</span>
                    </span>
                  </div>
                  <div className="number-kpi number-kbars" aria-hidden="true">
                    <span className="number-klabel">By region</span>
                    {' '}
                    <span className="number-bars">
                      <i style={{ '--h': '1' }} />
                      <i style={{ '--h': '0.82' }} />
                      <i style={{ '--h': '0.7' }} />
                      <i style={{ '--h': '0.52' }} />
                    </span>
                  </div>
                </div>
                <table className="number-table number-rl">
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>Late orders</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>North</td>
                      <td>389</td>
                      <td>33%</td>
                    </tr>
                    <tr>
                      <td>East</td>
                      <td>319</td>
                      <td>27%</td>
                    </tr>
                    <tr>
                      <td>South</td>
                      <td>271</td>
                      <td>23%</td>
                    </tr>
                    <tr>
                      <td>West</td>
                      <td>201</td>
                      <td>17%</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td>1,180</td>
                      <td>100%</td>
                    </tr>
                  </tfoot>
                </table>
                <p className="number-foot number-rl">
                  <span>Definition: delivered_at &gt; promised_date</span>
                  <span>Source: ERP export, Dec 31</span>
                </p>
              </article>
            </div>
          </div>
        </div>
        <div className="number-stack">
          <ul className="number-tower" aria-label="The year’s plan">
            <li className="number-block">
              <span>2027 budget</span>
              <em>Finance</em>
            </li>
            <li className="number-block">
              <span>Carrier contracts</span>
              <em>Renewed</em>
            </li>
            <li className="number-block">
              <span>Delivery fixes</span>
              <em>1,180 orders</em>
            </li>
            <li className="number-block">
              <span>Revenue forecast</span>
              <em>FY 2027</em>
            </li>
            <li className="number-block">
              <span>Board deck</span>
              <em>Q1</em>
            </li>
          </ul>
          <p className="number-fig">
            <span className="number-cap" aria-hidden="true">Late orders · Q4</span>
            <span className="number-digits">1,180</span>
            <span className="number-stop" />
            <span className="sr-only">.</span>
          </p>
        </div>
        <div className="number-chart" aria-hidden="true">
          <svg className="number-svg" width="100%" height="100%">
            <defs>
              <linearGradient id="number-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#c9ccc2" />
                <stop offset="0.42" stopColor="#b9bcb2" />
                <stop offset="1" stopColor="#f2607e" />
              </linearGradient>
              <linearGradient id="number-fill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f2607e" stopOpacity="0.16" />
                <stop offset="1" stopColor="#f2607e" stopOpacity="0" />
              </linearGradient>
              <clipPath id="number-clip">
                <rect className="number-cliprect" x="0" y="0" width="0" height="0" />
              </clipPath>
            </defs>
            <line className="number-axis" x1="0" y1="0" x2="0" y2="0" />
            <path className="number-plan" pathLength="1" d="M0 0" />
            <path className="number-area" clipPath="url(#number-clip)" d="M0 0" />
            <path className="number-line" pathLength="1" d="M0 0" />
          </svg>
          {' '}
          <span className="number-month">Jan</span>
          <span className="number-month">Feb</span>
          <span className="number-month">Mar</span>
          <span className="number-month">Apr</span>
          <span className="number-month">May</span>
          {' '}
          <span className="number-tag number-tag-plan">Plan</span>
          {' '}
          <span className="number-tag number-tag-rev">Revenue <b>−20%</b></span>
        </div>
        <div className="number-fallout">
          <p className="h2 number-fh">By spring, revenue was down&nbsp;20%.</p>
        </div>
      </div>
    </section>
  )
}
