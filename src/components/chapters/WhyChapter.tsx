/**
 * 050-why - that’s why we built Prism.
 *
 * Markup only. Its motion is src/motion/chapters/050-why.js
 * and its styles src/styles/chapters/050-why.css: the class names and
 * data-* attributes here are what those look for, so change them together.
 */
export default function WhyChapter() {
  return (
    <section className="chapter" id="ch-why" data-chapter="why" data-len="1.2">
      <div className="stage why-stage">
        <div className="why-floor" aria-hidden="true" />
        <div className="why-rays" aria-hidden="true" />
        <div className="why-lock">
          <h2 className="why-h">
            <i className="why-glow" aria-hidden="true" />
            {' '}
            <span className="sr-only">That’s why we built Prism.</span>
            {' '}
            <span className="why-l1" aria-hidden="true">
              <span className="why-w">That’s</span>
              {' '}
              <span className="why-w">why</span>
              {' '}
              <span className="why-w">we</span>
              {' '}
              <span className="why-w">built</span>
            </span>
            {' '}
            <span className="why-l2" aria-hidden="true">
              <span className="why-c">P</span>
              <span className="why-c">r</span>
              <span className="why-c why-i">ı</span>
              <span className="why-c">s</span>
              <span className="why-c">m</span>
              <span className="why-c why-stop">.</span>
              <i className="why-base" />
            </span>
          </h2>
        </div>
        <p className="why-bridge">
          <span className="why-bm why-bm1">
            <span className="why-b why-b1">Same Monday<i className="why-base2" /><span className="sr-only">.</span></span>
          </span>
          {' '}
          <span className="why-gap" aria-hidden="true" />
          {' '}
          <span className="why-bm why-bm2">
            <span className="why-b why-b2">Same question.</span>
          </span>
        </p>
      </div>
    </section>
  )
}
