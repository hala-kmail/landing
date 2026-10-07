/**
 * 090-hands - every number stays in the right hands.
 *
 * Markup only. Its motion is src/motion/chapters/090-hands.js
 * and its styles src/styles/chapters/090-hands.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
export default function HandsChapter() {
  return (
    <section className="chapter" id="ch-hands" data-chapter="hands" data-len="1.65">
      <div className="stage hands-stage">
        <div className="hands-grid">
          <div className="hands-copy">
            <h2 className="h2 hands-h2">
              <span className="hands-mask">
                <span className="hands-ln">Every number stays</span>
              </span>
              {' '}
              <span className="hands-mask">
                <span className="hands-ln">in the right hands.</span>
              </span>
            </h2>
            <p className="lead hands-lead">Each role sees only what it should — decided field by field, before any answer is written.</p>
          </div>
          <div className="hands-cards">
            <div className="hands-switch" role="group" aria-labelledby="hands-viewas">
              <div className="hands-switch-top">
                <span id="hands-viewas" className="label">View as</span>
                {' '}
                <span className="label hands-count" aria-live="polite">
                  <span className="hands-count-txt">3 fields masked</span>
                </span>
              </div>
              <div className="hands-track" aria-hidden="true">
                <i className="hands-fill" />
                {' '}
                <i className="hands-stop" />
                <i className="hands-stop" />
                <i className="hands-stop" />
              </div>
              <div className="hands-roles">
                <button type="button" className="hands-role" data-role="0" data-p="0.2" aria-pressed="true">Analyst</button>
                {' '}
                <button type="button" className="hands-role" data-role="1" data-p="0.48" aria-pressed="false">Sales manager</button>
                {' '}
                <button type="button" className="hands-role" data-role="2" data-p="0.75" aria-pressed="false">Owner</button>
              </div>
            </div>
            <div className="hands-tilt">
              <div className="hands-card card">
                <div className="hands-card-head">
                  <span className="hands-src">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" />
                      <path d="M4.5 5.5v13c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-13" />
                      <path d="M4.5 12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8" />
                    </svg>
                    {' '}
                    <span className="mono">sales.customers</span>
                  </span>
                  {' '}
                  <span className="hands-policy"> <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7.5 3v5.6c0 4.5-3.1 8.2-7.5 9.4-4.4-1.2-7.5-4.9-7.5-9.4V6z" /></svg> Policy · <b>Customer PII</b> </span>
                </div>
                <div className="hands-table" role="table" aria-label="Customers, as the selected role sees them">
                  <div className="hands-row hands-thead" role="row">
                    <span className="hands-c" role="columnheader">Customer <em className="hands-tag" data-col="name">hashed</em></span>
                    {' '}
                    <span className="hands-c" role="columnheader">Email <em className="hands-tag" data-col="email">email</em></span>
                    {' '}
                    <span className="hands-c" role="columnheader">Phone <em className="hands-tag" data-col="phone">redacted</em></span>
                    {' '}
                    <span className="hands-c" role="columnheader">Region</span>
                    {' '}
                    <span className="hands-c hands-num" role="columnheader">Revenue</span>
                  </div>
                  <div className="hands-row hands-tr" role="row">
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="name">cus_7f3a91</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="email">n•••@example.com</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="phone">••••••••</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">Riyadh</span>
                    {' '}
                    <span className="hands-c hands-num tnum" role="cell">SAR 184,200</span>
                  </div>
                  <div className="hands-row hands-tr" role="row">
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="name">cus_c20e4b</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="email">o•••@example.com</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="phone">••••••••</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">Jeddah</span>
                    {' '}
                    <span className="hands-c hands-num tnum" role="cell">SAR 142,750</span>
                  </div>
                  <div className="hands-row hands-tr" role="row">
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="name">cus_9b17d2</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="email">l•••@example.com</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="phone">••••••••</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">Dubai</span>
                    {' '}
                    <span className="hands-c hands-num tnum" role="cell">SAR 128,400</span>
                  </div>
                  <div className="hands-row hands-tr" role="row">
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="name">cus_4ea6f0</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="email">f•••@example.com</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="phone">••••••••</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">Dammam</span>
                    {' '}
                    <span className="hands-c hands-num tnum" role="cell">SAR 97,300</span>
                  </div>
                  <div className="hands-row hands-tr hands-tr-5" role="row">
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="name">cus_e5d382</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="email">s•••@example.com</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">
                      <span className="hands-v is-masked" data-col="phone">••••••••</span>
                    </span>
                    {' '}
                    <span className="hands-c" role="cell">Abu Dhabi</span>
                    {' '}
                    <span className="hands-c hands-num tnum" role="cell">SAR 88,950</span>
                  </div>
                </div>
              </div>
              <div className="hands-audit card">
                <div className="hands-audit-head">
                  <span className="label">Audit trail</span>
                  {' '}
                  <span className="label hands-rec"><i />Recorded</span>
                </div>
                <div className="hands-logbox">
                  <ol className="hands-log" reversed>
                    <li className="hands-entry hands-you" aria-hidden="true">
                      <time className="mono tnum">now</time>
                      <b>You</b>
                      <span className="hands-q">“Late orders by region”</span>
                      <em className="mono hands-you-n">as Owner · 0 masked</em>
                    </li>
                    <li className="hands-entry" data-role="2">
                      <time className="mono tnum">10:42:57</time>
                      <b>Owner</b>
                      <span className="hands-q">“Late orders by region”</span>
                      <em className="mono">0 masked</em>
                    </li>
                    <li className="hands-entry" data-role="1">
                      <time className="mono tnum">10:42:31</time>
                      <b>Sales manager</b>
                      <span className="hands-q">“Late orders by region”</span>
                      <em className="mono">2 masked</em>
                    </li>
                    <li className="hands-entry" data-role="0">
                      <time className="mono tnum">10:42:08</time>
                      <b>Analyst</b>
                      <span className="hands-q">“Late orders by region”</span>
                      <em className="mono">3 masked</em>
                    </li>
                    <li className="hands-entry hands-old">
                      <time className="mono tnum">10:31:44</time>
                      <b>Finance lead</b>
                      <span className="hands-q">“Revenue by branch, Q4”</span>
                      <em className="mono">1 masked</em>
                    </li>
                    <li className="hands-entry hands-old">
                      <time className="mono tnum">10:18:02</time>
                      <b>Analyst</b>
                      <span className="hands-q">“Top customers by margin”</span>
                      <em className="mono">3 masked</em>
                    </li>
                    <li className="hands-entry hands-old">
                      <time className="mono tnum">09:57:36</time>
                      <b>Owner</b>
                      <span className="hands-q">“Board pack figures”</span>
                      <em className="mono">0 masked</em>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="chapter-label label hands-label"><b>04</b> Right data, right hands</div>
      </div>
    </section>
  )
}
