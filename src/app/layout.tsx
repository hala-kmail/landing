import type { Metadata, Viewport } from 'next'
import { preload } from 'react-dom'

// order matters: base first, then the chapters in story order (the same cascade as before)
import 'lenis/dist/lenis.css'
import '@/styles/base.css'
import '@/styles/chapters/000-hero.css'
import '@/styles/chapters/010-questions.css'
import '@/styles/chapters/020-wait.css'
import '@/styles/chapters/030-number.css'
import '@/styles/chapters/040-truth.css'
import '@/styles/chapters/050-why.css'
import '@/styles/chapters/060-asks.css'
import '@/styles/chapters/070-steps.css'
import '@/styles/chapters/080-language.css'
import '@/styles/chapters/090-hands.css'
import '@/styles/chapters/100-minutes.css'
import '@/styles/chapters/110-finale.css'
import '@/styles/chapters/900-after.css'

export const metadata: Metadata = {
  title: 'PRISM — Your all-in-one Enterprise AI Assistant',
  description:
    'Ask your company data anything in plain language. A team of AI agents queries it live, asks when a question could mean two things, and traces every number back to its source.',
  openGraph: {
    title: 'PRISM — Your all-in-one Enterprise AI Assistant',
    description: 'Answers you can check, not just answers.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050505',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  // the hero's two weights, early. Production only: in development the stylesheets
  // arrive late, and the browser would just flag the preloads as unused.
  if (process.env.NODE_ENV === 'production') {
    preload('/assets/fonts/tajawal-latin-700.woff2', { as: 'font', type: 'font/woff2', crossOrigin: '' })
    preload('/assets/fonts/tajawal-latin-400.woff2', { as: 'font', type: 'font/woff2', crossOrigin: '' })
  }
  return (
    // the story's stylesheets lay stages out as fixed layers only under html.js, so the
    // class goes on before the first paint; without scripts the page reads top to bottom
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
