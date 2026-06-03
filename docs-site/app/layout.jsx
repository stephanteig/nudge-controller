import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import themeConfig from '../theme.config.jsx'

export const metadata = {
  title: {
    default: 'Nudge Controller',
    template: '%s — Nudge Controller',
  },
  description:
    'Open source DIY Bluetooth editing controller for DaVinci Resolve — a ~$130 alternative to the Blackmagic Speed Editor.',
}

const logo = (
  <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.5px' }}>
    NUDGE <span style={{ color: themeConfig.accent }}>CONTROLLER</span>
  </span>
)

const navbar = <Navbar logo={logo} projectLink={themeConfig.github} />
const footer = <Footer>{themeConfig.footerText}</Footer>

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase={themeConfig.docsRepositoryBase}
          footer={footer}
          editLink="Edit this page on GitHub"
          sidebar={{ defaultMenuCollapseLevel: 1, toggleButton: true }}
          nextThemes={{ defaultTheme: 'dark' }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
