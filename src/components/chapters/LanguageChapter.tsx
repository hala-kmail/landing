/**
 * 080-language - it learns your business language, and works where the data lives.
 *
 * Markup only. Its motion is src/motion/chapters/080-language.js
 * and its styles src/styles/chapters/080-language.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
export default function LanguageChapter() {
  return (
    <section className="chapter" id="ch-language" data-chapter="language" data-len="2.45">
      <div className="stage lang-stage">
        <svg className="lang-svg" aria-hidden="true" focusable="false" />
        {' '}
        {/* beat 1: business words → columns */}
        {' '}
        <h2 className="h2 lang-title lang-t1">
          <span className="lang-ln">
            <span>It learns your business language</span>
          </span>
          {' '}
          <span className="lang-ln">
            <span>before it answers.</span>
          </span>
        </h2>
        <div className="lang-map">
          <div className="lang-col lang-terms" role="group" aria-label="Your words">
            <p className="label lang-eyebrow" aria-hidden="true">Your words</p>
            {' '}
            <button className="lang-term" type="button" data-i="0" data-p="0.15" aria-describedby="lang-def-0">
              <span className="lang-term-t">late delivery</span>
              <i className="lang-pip" />
            </button>
            {' '}
            <button className="lang-term" type="button" data-i="1" data-p="0.23" aria-describedby="lang-def-1">
              <span className="lang-term-t">open order</span>
              <i className="lang-pip" />
            </button>
            {' '}
            <button className="lang-term" type="button" data-i="2" data-p="0.29" aria-describedby="lang-def-2">
              <span className="lang-term-t">net revenue</span>
              <i className="lang-pip" />
            </button>
            {' '}
            <button className="lang-term" type="button" data-i="3" data-p="0.35" aria-describedby="lang-def-3">
              <span className="lang-term-t">region</span>
              <i className="lang-pip" />
            </button>
          </div>
          <div className="lang-col lang-cols" role="list" aria-label="Your database">
            <p className="label lang-eyebrow" aria-hidden="true">Your database</p>
            {' '}
            <span className="lang-colm" role="listitem" data-i="1">
              <i className="lang-pip" />
              <code>orders.status</code>
            </span>
            {' '}
            <span className="lang-colm" role="listitem" data-i="0">
              <i className="lang-pip" />
              <code>deliveries.delivered_at</code>
            </span>
            {' '}
            <span className="lang-colm" role="listitem" data-i="3">
              <i className="lang-pip" />
              <code>branches.region</code>
            </span>
            {' '}
            <span className="lang-colm" role="listitem" data-i="2">
              <i className="lang-pip" />
              <code>invoices.amount</code>
            </span>
          </div>
          <p className="lang-def" id="lang-def-0" data-i="0">after the requested date</p>
          <p className="lang-def" id="lang-def-1" data-i="1">status = &apos;open&apos;</p>
          <p className="lang-def" id="lang-def-2" data-i="2">sum of invoice amounts</p>
          <p className="lang-def" id="lang-def-3" data-i="3">the branch&apos;s region</p>
        </div>
        {' '}
        {/* the Arabic beat: the same thread, switched to Arabic - the whole card turns right to left */}
        <h2 className="h2 lang-title lang-t3">
          <span className="lang-ln">
            <span>Ask in English or Arabic.</span>
          </span>
        </h2>
        <div className="lang-card card" role="group" aria-label="A Prism thread, switched from English to Arabic">
          <div className="lang-sw" aria-hidden="true">
            <span className="lang-sw-en">EN</span>
            <i className="lang-sw-track"><b className="lang-sw-knob" /></i>
            <span className="lang-sw-ar">ع</span>
          </div>
          <div className="lang-faces">
            <div className="lang-face lang-face-en" lang="en">
              <p className="lang-head"><i className="lang-head-pip" />Thread<span className="lang-src">ops_db · PostgreSQL</span></p>
              <p className="lang-you">How many orders arrived late last quarter?</p>
              <p className="lang-think"><span className="lang-agents">Agents</span><span>Reading <code>orders</code> and <code>deliveries</code></span></p>
              <p className="lang-ans"><span className="lang-check" aria-hidden="true" /><span><b className="tnum">4,630</b> orders arrived after the date the customer asked for.</span></p>
            </div>
            <div className="lang-face lang-face-ar" dir="rtl" lang="ar">
              <p className="lang-head"><i className="lang-head-pip" />محادثة<span className="lang-src" dir="ltr">ops_db · PostgreSQL</span></p>
              <p className="lang-you">كم طلباً تأخّر الربع الماضي؟</p>
              <p className="lang-think"><span className="lang-agents">الوكلاء</span><span>أقرأ جدولَي <code>orders</code> و <code>deliveries</code></span></p>
              <p className="lang-ans"><span className="lang-check" aria-hidden="true" /><span><b className="tnum" dir="ltr">4,630</b> طلباً وصلت بعد الموعد الذي حدده العميل.</span></p>
            </div>
          </div>
          <i className="lang-sweep" aria-hidden="true" />
        </div>
        <p className="lead lang-lead">The whole workspace turns right to left, and the answer comes back in Arabic.</p>
        {' '}
        {/* beat 2: where the data lives */}
        {' '}
        <h2 className="h2 lang-title lang-t2">
          <span className="lang-ln">
            <span>It works on your data,</span>
          </span>
          {' '}
          <span className="lang-ln">
            <span>right where it lives.</span>
          </span>
        </h2>
        <p className="lead lang-lead2">Read-only. It never changes your data.</p>
        {' '}
        <i className="lang-hub" aria-hidden="true" />
        {' '}
        <ul className="lang-dbs" aria-label="Databases Prism connects to">
          <li className="lang-db" data-i="0">
            <svg className="lang-glyph" viewBox="0 0 24 24" aria-hidden="true">
              <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
              <path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13" />
              <path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
            </svg>
            {' '}
            <span className="lang-db-t">
              <span className="lang-db-name">Oracle</span>
              <span className="lang-db-uri">oracle://</span>
            </span>
          </li>
          <li className="lang-db" data-i="1">
            <svg className="lang-glyph" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="4" width="16" height="7" rx="1.6" />
              <rect x="4" y="13" width="16" height="7" rx="1.6" />
              <path d="M7.5 7.5h.01M7.5 16.5h.01M11 7.5h5M11 16.5h5" />
            </svg>
            {' '}
            <span className="lang-db-t">
              <span className="lang-db-name">SQL Server</span>
              <span className="lang-db-uri">mssql://</span>
            </span>
          </li>
          <li className="lang-db" data-i="2">
            <svg className="lang-glyph" viewBox="0 0 24 24" aria-hidden="true">
              <ellipse cx="9.5" cy="6" rx="5.5" ry="2.2" />
              <path d="M4 6v11.5c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2V6" />
              <path d="M4 11.8c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2" />
              <path d="M15 15.5h6m-2.4-2.4 2.4 2.4-2.4 2.4" />
            </svg>
            {' '}
            <span className="lang-db-t">
              <span className="lang-db-name">PostgreSQL</span>
              <span className="lang-db-uri">postgres://</span>
            </span>
          </li>
          <li className="lang-db" data-i="3">
            <svg className="lang-glyph" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
              <path d="M3.5 9.5h17M3.5 14.5h17M9.5 9.5v10" />
            </svg>
            {' '}
            <span className="lang-db-t">
              <span className="lang-db-name">MySQL</span>
              <span className="lang-db-uri">mysql://</span>
            </span>
          </li>
          <li className="lang-db" data-i="4">
            <svg className="lang-glyph" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.5 4.5C7.5 4.5 7 5.5 7 7v2.6c0 1.2-.8 2-2 2.4 1.2.4 2 1.2 2 2.4V17c0 1.5.5 2.5 2.5 2.5M14.5 4.5c2 0 2.5 1 2.5 2.5v2.6c0 1.2.8 2 2 2.4-1.2.4-2 1.2-2 2.4V17c0 1.5-.5 2.5-2.5 2.5" />
            </svg>
            {' '}
            <span className="lang-db-t">
              <span className="lang-db-name">MongoDB</span>
              <span className="lang-db-uri">mongodb://</span>
            </span>
          </li>
        </ul>
        <div className="chapter-label label lang-label"><b>03</b> Learns your language</div>
      </div>
    </section>
  )
}
