/**
 * 070-steps - every number traces back to a query you can read.
 *
 * Markup only. Its motion is src/motion/chapters/070-steps.js
 * and its styles src/styles/chapters/070-steps.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
export default function StepsChapter() {
  return (
    <section className="chapter" id="ch-steps" data-chapter="steps" data-len="2.45">
      <div className="stage steps-stage">
        <header className="steps-head">
          <h2 className="h2 steps-title">
            <span className="steps-ln">
              <span>Every number traces back</span>
            </span>
            {' '}
            <span className="steps-ln">
              <span>to a query you <em className="steps-em">can read.</em></span>
            </span>
          </h2>
          <p className="lead steps-lead">A team of AI agents explores, analyzes and checks each other&apos;s work — and every step stays open to you.</p>
        </header>
        <div className="steps-view" role="group" aria-label="Prism's run graph for “How many orders arrived late last quarter?”">
          <div className="steps-world">
            <svg className="steps-edges" aria-hidden="true" focusable="false" />
            {' '}
            <button className="steps-node" type="button" data-node="plan" data-p="0.13" aria-describedby="steps-tip-plan">
              <span className="steps-node-top" aria-hidden="true">
                <span className="steps-node-id">
                  <span className="steps-av">1</span>
                  <span className="steps-agent">Lead analyst</span>
                </span>
                {' '}
                <span className="steps-status">
                  <i />
                  <span className="steps-st-q">Queued</span>
                  <span className="steps-st-r">Running</span>
                  <span className="steps-st-d">Done</span>
                </span>
              </span>
              {' '}
              <span className="steps-node-title">Plan</span>
              {' '}
              <span className="steps-node-sub">late = after requested date</span>
              {' '}
              <span className="steps-tip" id="steps-tip-plan" role="tooltip" aria-hidden="true">Plans the work from the definition you chose, and splits your question into tasks that run in parallel.</span>
            </button>
            {' '}
            <button className="steps-node" type="button" data-node="orders" data-p="0.23" aria-describedby="steps-tip-orders">
              <span className="steps-node-top" aria-hidden="true">
                <span className="steps-node-id">
                  <span className="steps-av">2</span>
                  <span className="steps-agent">Explorer</span>
                </span>
                {' '}
                <span className="steps-status">
                  <i />
                  <span className="steps-st-q">Queued</span>
                  <span className="steps-st-r">Running</span>
                  <span className="steps-st-d">Done</span>
                </span>
              </span>
              {' '}
              <span className="steps-node-title mono">orders</span>
              {' '}
              <span className="steps-node-sub mono">id · requested_date</span>
              {' '}
              <span className="steps-tip" id="steps-tip-orders" role="tooltip" aria-hidden="true">Finds where your orders live in the schema: the table, the date each customer asked for, and how it joins to deliveries.</span>
            </button>
            {' '}
            <button className="steps-node" type="button" data-node="deliveries" data-p="0.23" aria-describedby="steps-tip-deliveries">
              <span className="steps-node-top" aria-hidden="true">
                <span className="steps-node-id">
                  <span className="steps-av">2</span>
                  <span className="steps-agent">Explorer</span>
                </span>
                {' '}
                <span className="steps-status">
                  <i />
                  <span className="steps-st-q">Queued</span>
                  <span className="steps-st-r">Running</span>
                  <span className="steps-st-d">Done</span>
                </span>
              </span>
              {' '}
              <span className="steps-node-title mono">deliveries</span>
              {' '}
              <span className="steps-node-sub mono">order_id · delivered_at</span>
              {' '}
              <span className="steps-tip" id="steps-tip-deliveries" role="tooltip" aria-hidden="true">Runs in parallel: reads the deliveries table and finds the moment each order arrived.</span>
            </button>
            {' '}
            <button className="steps-node" type="button" data-node="sql" data-p="0.42" aria-describedby="steps-tip-sql">
              <span className="steps-node-top" aria-hidden="true">
                <span className="steps-node-id">
                  <span className="steps-av">3</span>
                  <span className="steps-agent">Analyst</span>
                </span>
                {' '}
                <span className="steps-status">
                  <i />
                  <span className="steps-st-q">Queued</span>
                  <span className="steps-st-r">Writing</span>
                  <span className="steps-st-d">Done</span>
                </span>
              </span>
              {' '}
              <span className="steps-node-title">Write SQL</span>
              {' '}
              <span className="steps-node-sub">One query, in plain sight</span>
              {' '}
              <span className="steps-tip" id="steps-tip-sql" role="tooltip" aria-hidden="true">Writes one query you can read — the exact SQL that produced the number.</span>
            </button>
            {' '}
            <button className="steps-node" type="button" data-node="run" data-p="0.56" aria-describedby="steps-tip-run">
              <span className="steps-node-top" aria-hidden="true">
                <span className="steps-node-id">
                  <span className="steps-av">4</span>
                  <span className="steps-agent">PostgreSQL</span>
                </span>
                {' '}
                <span className="steps-status">
                  <i />
                  <span className="steps-st-q">Queued</span>
                  <span className="steps-st-r">Running</span>
                  <span className="steps-st-d">Done</span>
                </span>
              </span>
              {' '}
              <span className="steps-node-title">Run on your database</span>
              {' '}
              <span className="steps-node-sub">
                <span className="steps-run-a">Where the data lives</span>
                <span className="steps-run-b">1 row · late_orders</span>
              </span>
              {' '}
              <span className="steps-tip" id="steps-tip-run" role="tooltip" aria-hidden="true">Runs the query on your own database, where the data already lives. One row comes back.</span>
            </button>
            {' '}
            <button className="steps-node steps-node-review" type="button" data-node="review" data-p="0.66" aria-describedby="steps-tip-review">
              <span className="steps-node-top" aria-hidden="true">
                <span className="steps-node-id">
                  <span className="steps-av">5</span>
                  <span className="steps-agent">Reviewer</span>
                </span>
                {' '}
                <span className="steps-status">
                  <i />
                  <span className="steps-st-q">Queued</span>
                  <span className="steps-st-r">Checking</span>
                  <span className="steps-st-d">Verified</span>
                </span>
              </span>
              {' '}
              <span className="steps-node-title">Review</span>
              {' '}
              <span className="steps-node-sub steps-note">Matches validated values <b className="steps-check">✓</b></span>
              {' '}
              <span className="steps-tip" id="steps-tip-review" role="tooltip" aria-hidden="true">A second agent checks every reading before it reaches you: this one matches the validated value on record.</span>
            </button>
            {' '}
            <button className="steps-node steps-node-answer" type="button" data-node="answer" data-p="0.78" aria-describedby="steps-tip-answer">
              <span className="steps-node-top" aria-hidden="true">
                <span className="steps-node-id">
                  <span className="steps-av steps-av-ok">
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M3.5 8.5l3 3 6-7" />
                    </svg>
                  </span>
                  <span className="steps-agent">Answer</span>
                </span>
                {' '}
                <span className="steps-status">
                  <i />
                  <span className="steps-st-q">Queued</span>
                  <span className="steps-st-r">Writing</span>
                  <span className="steps-st-d">Ready</span>
                </span>
              </span>
              {' '}
              <span className="steps-node-title">
                <span className="steps-num tnum">4,630</span>
              </span>
              {' '}
              <span className="steps-node-sub">orders delivered after the requested date</span>
              {' '}
              <span className="steps-tip" id="steps-tip-answer" role="tooltip" aria-hidden="true">4,630 — and every step that found it stays open: the plan, the tables, the query, the check.</span>
            </button>
            {' '}
            <svg className="steps-trails" aria-hidden="true" focusable="false" />
          </div>
        </div>
        <figure className="steps-sql card" aria-label="The SQL Prism wrote">
          <figcaption className="steps-sql-head">
            <span className="steps-sql-file"><i aria-hidden="true" />SQL · Analyst</span>
            {' '}
            <span className="chip steps-sql-db">PostgreSQL</span>
          </figcaption>
          <pre className="steps-code"><code>{`SELECT COUNT(DISTINCT o.id) AS late_orders
FROM orders o
JOIN deliveries d ON d.order_id = o.id
WHERE d.delivered_at::date > o.requested_date
  AND d.delivered_at >= DATE '2026-10-01'
  AND d.delivered_at <  DATE '2027-01-01';`}</code></pre>
          <div className="steps-sql-foot" aria-hidden="true">
            <span className="steps-sf steps-sf-0"><i className="steps-spin" />Writing</span>
            {' '}
            <span className="steps-sf steps-sf-1">Ready to run</span>
            {' '}
            <span className="steps-sf steps-sf-2"><i className="steps-spin" />Running on your database</span>
            {' '}
            <span className="steps-sf steps-sf-3">1 row · <b className="tnum">4,630</b></span>
            {' '}
            <span className="steps-sf steps-sf-4">1 row · <b className="tnum">4,630</b> · verified <b className="steps-check">✓</b></span>
          </div>
          {' '}
          <i className="steps-spine" aria-hidden="true" />
        </figure>
        <div className="chapter-label label steps-label"><b>02</b> Shows every step</div>
      </div>
    </section>
  )
}
