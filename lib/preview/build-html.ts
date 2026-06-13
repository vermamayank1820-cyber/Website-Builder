const REACT_CDN = 'https://unpkg.com/react@18/umd/react.production.min.js'
const REACT_DOM_CDN = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
const BABEL_CDN = 'https://unpkg.com/@babel/standalone/babel.min.js'
const TAILWIND_CDN = 'https://cdn.tailwindcss.com'

/**
 * Premium type system loaded into every preview/screenshot/thumbnail.
 * Five families, five clear roles — characterful enough to escape the
 * system-UI "AI template" look, disciplined enough to pair cleanly:
 *   Inter           → font-sans      (neutral premium UI/body/modern display)
 *   Fraunces        → font-serif     (luxury editorial serif, optical + soft)
 *   Space Grotesk   → font-display   (geometric display: tech/agency/startup)
 *   Instrument Serif→ font-editorial (high-contrast magazine display serif)
 *   JetBrains Mono  → font-mono      (labels, data, code, fintech figures)
 * The system prompt teaches the model these exact utilities; keep the two
 * in sync. The sandbox is allow-scripts only, which does NOT block font
 * resource loading (it already loads CDN scripts the same way).
 */
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  'family=Inter:wght@300;400;500;600;700;800;900&' +
  'family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..600&' +
  'family=Space+Grotesk:wght@400;500;600;700&' +
  'family=Instrument+Serif:ital@0;1&' +
  'family=JetBrains+Mono:wght@400;500;700&' +
  'display=swap'

/** Maps the font utilities to the loaded families (Tailwind Play CDN config). */
const TAILWIND_FONT_CONFIG = `
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
              serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
              display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'sans-serif'],
              editorial: ['"Instrument Serif"', 'Fraunces', 'ui-serif', 'serif'],
              mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
            },
          },
        },
      };`

/**
 * Escapes "</script" sequences so the generated component code can be
 * embedded inside an inline <script> tag without prematurely closing it.
 */
function escapeScriptTag(code: string): string {
  return code.replace(/<\/script/gi, '<\\/script')
}

/**
 * Builds a self-contained HTML document that renders a generated
 * `function Page() { ... }` component using React + Babel + Tailwind
 * loaded from CDNs. Intended for a sandboxed iframe (allow-scripts only).
 */
export function buildPreviewHtml(code: string): string {
  const safeCode = escapeScriptTag(code)

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${GOOGLE_FONTS_HREF}" />
    <script src="${REACT_CDN}"></script>
    <script src="${REACT_DOM_CDN}"></script>
    <script src="${BABEL_CDN}"></script>
    <script src="${TAILWIND_CDN}"></script>
    <script>${TAILWIND_FONT_CONFIG}</script>
    <style>
      html, body, #root { height: 100%; }
      body { margin: 0; font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
      html { scroll-behavior: smooth; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.onerror = function (message) {
        const root = document.getElementById('root');
        if (root && !root.hasChildNodes()) {
          root.innerHTML =
            '<pre style="padding:1rem;color:#dc2626;white-space:pre-wrap;font-family:monospace;">' +
            'Preview error: ' + message +
            '</pre>';
        }
      };

      // Lets the parent (BrowserPreview) scroll to a top-level section by
      // index — used by the virtual route dropdown. Navigation only, no
      // real routing.
      window.addEventListener('message', function (event) {
        if (!event.data || event.data.type !== 'promptsite:scroll') return;
        const root = document.getElementById('root');
        if (!root) return;
        const target = root.children[event.data.index];
        if (target && target.scrollIntoView) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    </script>
    <script type="text/babel" data-presets="react">
      const { useState, useEffect, useRef, useCallback } = React;

      ${safeCode}

      try {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<Page />);
      } catch (error) {
        document.getElementById('root').innerHTML =
          '<pre style="padding:1rem;color:#dc2626;white-space:pre-wrap;font-family:monospace;">' +
          'Preview error: ' + (error && error.message ? error.message : String(error)) +
          '</pre>';
      }
    </script>
  </body>
</html>`
}
