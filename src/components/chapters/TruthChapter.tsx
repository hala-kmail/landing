/**
 * 040-truth - the real number.
 *
 * Markup only. Its motion is src/motion/chapters/040-truth.js
 * and its styles src/styles/chapters/040-truth.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
export default function TruthChapter() {
  return (
    <section className="chapter" id="ch-truth" data-chapter="truth" data-len="1.65">
      <div className="stage truth-stage">
        <div className="number-stack truth-stack" aria-hidden="true">
          <ul className="number-tower">
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
            <span className="number-digits">1,180</span>
            <span className="number-stop" />
            <svg className="truth-crack" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path pathLength="1" d="M100 55 L86 40 L74 62 L60 45 L47 58 L33 38 L20 60 L8 44 L0 52" />
              <path pathLength="1" d="M74 62 L75 30 L75.8 16" />
              <path pathLength="1" d="M60 45 L58 75 L57.6 86" />
              <path pathLength="1" d="M33 38 L31 18 L30.8 16" />
              <path pathLength="1" d="M20 60 L19 82 L18.8 86" />
            </svg>
            <span className="truth-shard" style={{ clipPath: 'polygon(0% 0%, 30% 0%, 31% 18%, 33% 38%, 20% 60%, 8% 44%, 0% 52%)' }}>1,180</span>
            <span className="truth-shard" style={{ clipPath: 'polygon(30% 0%, 76% 0%, 75% 30%, 74% 62%, 60% 45%, 47% 58%, 33% 38%, 31% 18%)' }}>1,180</span>
            <span className="truth-shard" style={{ clipPath: 'polygon(76% 0%, 100% 0%, 100% 55%, 86% 40%, 74% 62%, 75% 30%)' }}>1,180</span>
            <span className="truth-shard" style={{ clipPath: 'polygon(0% 52%, 8% 44%, 20% 60%, 19% 82%, 18% 100%, 0% 100%)' }}>1,180</span>
            <span className="truth-shard" style={{ clipPath: 'polygon(20% 60%, 33% 38%, 47% 58%, 60% 45%, 58% 75%, 57% 100%, 18% 100%, 19% 82%)' }}>1,180</span>
            <span className="truth-shard" style={{ clipPath: 'polygon(60% 45%, 74% 62%, 86% 40%, 100% 55%, 100% 100%, 57% 100%, 58% 75%)' }}>1,180</span>
          </p>
        </div>
        <div className="truth-copy">
          <h2 className="truth-h">
            <span className="h2 truth-pre">The real number was</span>
            {' '}
            <span className="truth-fig">
              <span className="truth-figin">
                <span className="truth-digits">4,630</span>
                <span className="truth-stop" />
                <span className="sr-only">.</span>
              </span>
            </span>
          </h2>
          <div className="truth-slot">
            <p className="lead truth-lead">
              <span className="truth-l1">The report used <em className="truth-q">‘the date we promised’</em> as the deadline.</span>
              {' '}
              <span className="truth-l2">Nobody asked what <em className="truth-q truth-q-key">‘late’</em>&nbsp;meant.</span>
            </p>
            <p className="truth-end">
              <span className="truth-e1">One wrong number.</span>
              {' '}
              <span className="truth-e2">A whole year built on&nbsp;it.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
