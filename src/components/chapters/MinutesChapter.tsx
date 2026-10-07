/**
 * 100-minutes - your question comes back as a dashboard, a report, a decision.
 *
 * Markup only. Its motion is src/motion/chapters/100-minutes.js
 * and its styles src/styles/chapters/100-minutes.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
export default function MinutesChapter() {
  return (
    <section className="chapter" id="ch-minutes" data-chapter="minutes" data-len="2.65">
      <div className="stage minutes-stage">
        <i className="minutes-wave" aria-hidden="true" />
        {' '}
        <div className="minutes-copy">
          <h2 className="h2 minutes-h2">
            <span className="minutes-mask">
              <span className="minutes-ln">Your question</span>
            </span>
            {' '}
            <span className="minutes-mask">
              <span className="minutes-ln">comes back as</span>
            </span>
            {' '}
            <span className="minutes-mask minutes-slot">
              <span className="minutes-word">a dashboard,</span>
              {' '}
              <span className="minutes-word">a report,</span>
              {' '}
              <span className="minutes-word">a decision.</span>
            </span>
          </h2>
          <p className="lead minutes-lead">One question becomes charts, tables and a written report — in English or Arabic.</p>
        </div>
        <div className="minutes-visual">
          <div className="minutes-dash card">
            <div className="minutes-dbar">
              <div className="minutes-tabs">
                <button type="button" className="minutes-tab is-on" data-go="0.24" data-p="0.24" aria-pressed="true" aria-label="Show the dashboard">Dashboard</button>
                <button type="button" className="minutes-tab" data-go="0.45" data-p="0.45" aria-pressed="false" aria-label="Show the Arabic report">Report</button>
                <span className="minutes-tab minutes-tab-off" aria-hidden="true">SQL</span>
                {' '}
                <i className="minutes-tabline" aria-hidden="true" />
              </div>
              {' '}
              <span className="minutes-dsrc mono">postgresql · ops</span>
            </div>
            <p className="minutes-dq">“How many orders arrived late last quarter?”</p>
            <div className="minutes-grid">
              <article className="minutes-kpi minutes-kpi-main">
                <header>
                  <p className="minutes-kt">Late orders</p>
                  {' '}
                  <span className="minutes-ver">
                    <span className="minutes-light" aria-hidden="true" />
                    <span className="minutes-ver-a">Checking</span>
                    <span className="minutes-ver-b">Verified</span>
                  </span>
                </header>
                <p className="minutes-kv tnum">4,630</p>
                <p className="minutes-kc">After the requested date</p>
                {' '}
                <svg className="minutes-spark" viewBox="0 0 120 26" preserveAspectRatio="none" aria-hidden="true">
                  <path pathLength="1" d="M0 21 L10 20 L20 21.5 L30 19 L40 19.5 L50 17 L60 17.5 L70 14 L80 13 L90 10 L100 9.5 L110 6 L120 4" />
                </svg>
              </article>
              <article className="minutes-kpi">
                <header>
                  <p className="minutes-kt">Revenue at risk</p>
                </header>
                <p className="minutes-kv tnum">SAR 3.1M</p>
                <p className="minutes-kc">Customers with 2+ late orders</p>
                {' '}
                <svg className="minutes-spark" viewBox="0 0 120 26" preserveAspectRatio="none" aria-hidden="true">
                  <path pathLength="1" d="M0 18 L10 17 L20 18.5 L30 16 L40 15 L50 15.5 L60 13 L70 12.5 L80 11 L90 11.5 L100 9 L110 8 L120 7" />
                </svg>
              </article>
              <article className="minutes-kpi">
                <header>
                  <p className="minutes-kt">Routes to fix</p>
                </header>
                <p className="minutes-kv tnum">6</p>
                <p className="minutes-kc">Over half of all late orders</p>
                {' '}
                <svg className="minutes-spark" viewBox="0 0 120 26" preserveAspectRatio="none" aria-hidden="true">
                  <path pathLength="1" d="M0 20 L10 20 L20 19 L30 19.5 L40 18 L50 18 L60 16.5 L70 16 L80 15.5 L90 14 L100 13.5 L110 12 L120 11" />
                </svg>
              </article>
              <article className="minutes-card minutes-bars">
                <header>
                  <p className="minutes-ct">Late orders by region</p>
                  <p className="minutes-cc">Q4 · after the requested date</p>
                </header>
                <div className="minutes-hbars">
                  <div className="minutes-hb">
                    <span>Riyadh</span>
                    <i>
                      <b style={{ '--w': '1' }} />
                    </i>
                    <em className="tnum">1,402</em>
                  </div>
                  <div className="minutes-hb">
                    <span>Jeddah</span>
                    <i>
                      <b style={{ '--w': '0.8124' }} />
                    </i>
                    <em className="tnum">1,139</em>
                  </div>
                  <div className="minutes-hb">
                    <span>Dammam</span>
                    <i>
                      <b style={{ '--w': '0.592' }} />
                    </i>
                    <em className="tnum">830</em>
                  </div>
                  <div className="minutes-hb">
                    <span>Dubai</span>
                    <i>
                      <b style={{ '--w': '0.4964' }} />
                    </i>
                    <em className="tnum">696</em>
                  </div>
                  <div className="minutes-hb">
                    <span>Abu Dhabi</span>
                    <i>
                      <b style={{ '--w': '0.4016' }} />
                    </i>
                    <em className="tnum">563</em>
                  </div>
                </div>
              </article>
              <article className="minutes-card minutes-trend">
                <header>
                  <p className="minutes-ct">Late per month</p>
                  <p className="minutes-cc">Last 12 months</p>
                </header>
                {' '}
                <svg className="minutes-tsvg" viewBox="0 0 220 100" preserveAspectRatio="none" aria-hidden="true">
                  <path className="minutes-tgrid" d="M0 25 H220 M0 50 H220 M0 75 H220" />
                  <path className="minutes-tarea" d="M0 84 L20 82 L40 83 L60 79 L80 77 L100 72 L120 70 L140 61 L160 52 L180 44 L200 33 L220 24 L220 100 L0 100 Z" />
                  <path className="minutes-tline" pathLength="1" d="M0 84 L20 82 L40 83 L60 79 L80 77 L100 72 L120 70 L140 61 L160 52 L180 44 L200 33 L220 24" />
                </svg>
              </article>
            </div>
          </div>
          <div className="minutes-report card" dir="rtl" lang="ar">
            <div className="minutes-rmeta">
              <span className="minutes-rchip"><span className="minutes-rlight" aria-hidden="true" />تمت المراجعة</span>
              {' '}
              <span className="minutes-rper">الربع الأخير</span>
              {' '}
              <span className="minutes-rsrc mono" dir="ltr">postgresql · ops</span>
            </div>
            <p className="minutes-rtitle">تقرير الطلبات المتأخرة</p>
            <p className="minutes-rsub"><span className="tnum" dir="ltr">4,630</span> طلباً وصلت بعد الموعد الذي حدده العميل</p>
            <div className="minutes-rsec">
              <p className="minutes-rh"><span className="minutes-rn">١</span>الملخص</p>
              {' '}
              <i className="minutes-rl" style={{ '--w': '0.97' }} />
              <i className="minutes-rl" style={{ '--w': '0.9' }} />
              <i className="minutes-rl" style={{ '--w': '0.58' }} />
            </div>
            <div className="minutes-rsec">
              <p className="minutes-rh"><span className="minutes-rn">٢</span>حسب المنطقة</p>
              <div className="minutes-rbars">
                <div className="minutes-rb">
                  <span>الرياض</span>
                  <i>
                    <b style={{ '--w': '1' }} />
                  </i>
                  <em className="tnum">1,402</em>
                </div>
                <div className="minutes-rb">
                  <span>جدة</span>
                  <i>
                    <b style={{ '--w': '0.8124' }} />
                  </i>
                  <em className="tnum">1,139</em>
                </div>
                <div className="minutes-rb">
                  <span>الدمام</span>
                  <i>
                    <b style={{ '--w': '0.592' }} />
                  </i>
                  <em className="tnum">830</em>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="minutes-vs">
          <div className="minutes-then">
            <span className="label minutes-vl">Then · a ticket and a queue</span>
            {' '}
            <span className="minutes-days">
              <span className="minutes-dtxt">Days</span>
              <i className="minutes-strike" aria-hidden="true" />
            </span>
          </div>
          <div className="minutes-now">
            <span className="label minutes-vl minutes-vl-now">Now · one question</span>
            {' '}
            <span className="minutes-mins">Minutes<span className="minutes-stop" aria-hidden="true" /></span>
          </div>
        </div>
        <div className="minutes-year">
          <h3 className="h2 minutes-plan">
            <span className="minutes-mask">
              <span className="minutes-pl">And this time,</span>
            </span>
            {' '}
            <span className="minutes-mask">
              <span className="minutes-pl">the year goes to plan.</span>
            </span>
          </h3>
          <div className="minutes-chart" aria-hidden="true">
            <svg className="minutes-ysvg">
              <defs>
                <linearGradient id="minutes-area-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#c9f144" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#c9f144" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="minutes-ghost-grad" className="minutes-ghost-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#8a8d84" />
                  <stop offset="1" stopColor="#f2607e" />
                </linearGradient>
                <clipPath id="minutes-clip">
                  <rect className="minutes-cliprect" x="-20" y="-200" width="0" height="4000" />
                </clipPath>
                <linearGradient id="minutes-feather" className="minutes-feather" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset="1" stopColor="#000" />
                </linearGradient>
                <mask id="minutes-mask" maskUnits="userSpaceOnUse" x="-50" y="-500" width="6000" height="6000">
                  <rect x="-50" y="-500" width="6000" height="6000" fill="url(#minutes-feather)" />
                </mask>
              </defs>
              <g className="minutes-ygrid" />
              <path className="minutes-ghost" pathLength="1" />
              <path className="minutes-planline" pathLength="1" />
              <path className="minutes-yarea" mask="url(#minutes-mask)" />
              <g clipPath="url(#minutes-clip)">
                <path className="minutes-yglow" />
                <path className="minutes-yline" />
              </g>
            </svg>
            {' '}
            <div className="minutes-months">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
            {' '}
            <span className="minutes-tag minutes-tag-ghost label">Last year <b>−20%</b></span>
            {' '}
            <span className="minutes-tag minutes-tag-plan label">Plan</span>
            {' '}
            <span className="chip lime minutes-tag-on">On plan</span>
          </div>
        </div>
        <div className="chapter-label label minutes-label"><b>05</b> Minutes, not weeks</div>
      </div>
    </section>
  )
}
