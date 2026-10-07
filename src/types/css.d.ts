import 'react'

declare module 'react' {
  // inline styles set custom properties (--k, --w, --qs ...) that the chapter stylesheets read
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}
