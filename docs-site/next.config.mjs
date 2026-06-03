import nextra from 'nextra'

// Nextra 4 reads MDX from content/ and is themed via app/layout.jsx
// (the old `theme`/`themeConfig` keys are not valid Nextra 4 options).
const withNextra = nextra({
  defaultShowCopyCode: true,
})

export default withNextra({
  output: 'export',
  basePath: '/nudge-controller',
  images: { unoptimized: true },
})
// Note: `trailingSlash: true` breaks Nextra 4's optional catch-all export
// ("Cannot find module './undefined'"), so routes are served at their no-slash
// path (e.g. /firmware/flashing). Nextra's own links use that form.
