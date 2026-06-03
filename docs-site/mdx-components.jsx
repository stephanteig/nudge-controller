// Nextra 4 requires an mdx-components file exporting useMDXComponents.
// We merge the docs theme's components with any per-page overrides.
import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'

const docsComponents = getDocsMDXComponents()

export function useMDXComponents(components) {
  return {
    ...docsComponents,
    ...components,
  }
}
