/**
 * 010-questions - every company runs on questions.
 *
 * Markup only. Its motion is src/motion/chapters/010-questions.js
 * and its styles src/styles/chapters/010-questions.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
export default function QuestionsChapter() {
  return (
    <section className="chapter" id="ch-questions" data-chapter="questions" data-len="2.25">
      <div className="stage questions-stage">
        <div className="questions-dust" aria-hidden="true">
          <span>why?</span>
          <span>how many?</span>
          <span>where?</span>
          <span>who?</span>
          <span>when?</span>
          <span>which?</span>
          {' '}
          <span>how much?</span>
          <span>what if?</span>
          <span>since when?</span>
          <span>how long?</span>
          <span>why now?</span>
          <span>who else?</span>
          {' '}
          <span>how fast?</span>
          <span>what changed?</span>
          <span>is it real?</span>
          <span>why?</span>
          <span>how many?</span>
          <span>where?</span>
          {' '}
          <span>which one?</span>
          <span>by when?</span>
          <span>how often?</span>
          <span>what next?</span>
          <span>who owns it?</span>
          <span>why?</span>
        </div>
        <h2 className="h2 questions-h">
          <span className="questions-m">
            <span className="questions-w">Every</span>
          </span>
          {' '}
          <span className="questions-m">
            <span className="questions-w">company</span>
          </span>
          <br className="questions-br" />
          {' '}
          <span className="questions-m">
            <span className="questions-w">runs</span>
          </span>
          {' '}
          <span className="questions-m">
            <span className="questions-w">on</span>
          </span>
          {' '}
          <span className="questions-m">
            <span className="questions-w">questions<span className="questions-stop">.<i className="questions-base" /></span></span>
          </span>
        </h2>
        <ul className="questions-field" aria-label="Questions every company asks">
          <li className="questions-q" style={{ '--qs': '1.06', '--qw': '700' }}>Which region is slowing down?</li>
          <li className="questions-q" style={{ '--qs': '0.86', '--qw': '500' }}>Why did returns spike in March?</li>
          <li className="questions-q" style={{ '--qs': '1.2', '--qw': '700' }}>What should we do next?</li>
          <li className="questions-q" style={{ '--qs': '0.9', '--qw': '400' }}>How did revenue compare to budget?</li>
          <li className="questions-q" style={{ '--qs': '1.12', '--qw': '700' }}>Who are our best customers?</li>
          <li className="questions-q" style={{ '--qs': '0.84', '--qw': '500' }}>Which products drive margin?</li>
          <li className="questions-q" style={{ '--qs': '0.96', '--qw': '400' }}>Which clients have overdue invoices?</li>
          <li className="questions-q" style={{ '--qs': '1.18', '--qw': '700' }}>Where are we losing deals?</li>
          <li className="questions-q" style={{ '--qs': '0.88', '--qw': '500' }}>Which suppliers have the highest win rate?</li>
          <li className="questions-q" style={{ '--qs': '1.0', '--qw': '400' }}>What did the promotion actually earn?</li>
          <li className="questions-q" style={{ '--qs': '1.14', '--qw': '700' }}>Is churn getting worse?</li>
          <li className="questions-q" style={{ '--qs': '0.9', '--qw': '500' }}>Can I trust this data?</li>
        </ul>
        <div className="questions-final">
          {/* who asked it: the question is a person's, before it becomes a ticket (020-wait, same Monday 09:12) */}
          <p className="questions-who">
            <span className="questions-av" aria-hidden="true">RA</span>
            <span className="questions-who-t">
              <span className="questions-who-name">Reem Al-Otaibi</span>
              {' '}
              <span className="questions-who-meta">Head of Operations · asked Monday, 09:12</span>
            </span>
          </p>
          <p className="questions-big">
            <span className="questions-bl">How many orders</span>
            {' '}
            <span className="questions-bl">arrived late<span className="questions-qm">?<i className="questions-base" /></span></span>
          </p>
          <p className="lead questions-lead">
            <span className="questions-lm">
              <span className="questions-lw">The answers are already in your data.</span>
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
