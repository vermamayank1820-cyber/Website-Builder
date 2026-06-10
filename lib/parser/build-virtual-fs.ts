import type { PageSection, VirtualFile } from '@/types'

const GLOBALS_CSS = `/* Tailwind CSS v3 is loaded via CDN in the live preview — */
/* this file represents the design tokens used by the generated page. */

:root {
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}

html {
  scroll-behavior: smooth;
}
`

const IMG_SRC_REGEX = /<img[^>]*\ssrc=["']([^"']+)["']/g

/**
 * Projects the generated `Page()` source into a virtual file tree for the
 * Files/Code tabs. This is a UI-only representation — nothing here is
 * written back to the stored `code`.
 */
export function buildVirtualFs(code: string, sections: PageSection[]): VirtualFile[] {
  const componentFiles: VirtualFile[] = sections.map((section) => {
    const fileName = `${pascalCase(section.name)}.jsx`
    return {
      path: `src/components/${fileName}`,
      name: fileName,
      type: 'file',
      language: 'jsx',
      content: section.code,
    }
  })

  return [
    {
      path: 'src',
      name: 'src',
      type: 'folder',
      children: [
        {
          path: 'src/components',
          name: 'components',
          type: 'folder',
          children: componentFiles,
        },
        {
          path: 'src/pages',
          name: 'pages',
          type: 'folder',
          children: [
            {
              path: 'src/pages/LandingPage.jsx',
              name: 'LandingPage.jsx',
              type: 'file',
              language: 'jsx',
              content: code,
            },
          ],
        },
        {
          path: 'src/styles',
          name: 'styles',
          type: 'folder',
          children: [
            {
              path: 'src/styles/globals.css',
              name: 'globals.css',
              type: 'file',
              language: 'css',
              content: GLOBALS_CSS,
            },
          ],
        },
        {
          path: 'src/assets',
          name: 'assets',
          type: 'folder',
          children: buildAssetsFiles(code),
        },
      ],
    },
  ]
}

function buildAssetsFiles(code: string): VirtualFile[] {
  const urls = new Set<string>()
  for (const match of code.matchAll(IMG_SRC_REGEX)) {
    urls.add(match[1])
  }

  if (urls.size === 0) return []

  const content = `# Image assets\n\nReferenced by the generated page:\n\n${[...urls]
    .map((url) => `- ${url}`)
    .join('\n')}\n`

  return [
    {
      path: 'src/assets/images.md',
      name: 'images.md',
      type: 'file',
      language: 'markdown',
      content,
    },
  ]
}

/** Recursively finds a file by its full path within a virtual file tree. */
export function findVirtualFile(files: VirtualFile[], path: string): VirtualFile | null {
  for (const file of files) {
    if (file.path === path) return file
    if (file.children) {
      const found = findVirtualFile(file.children, path)
      if (found) return found
    }
  }
  return null
}

function pascalCase(value: string): string {
  return value
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}
