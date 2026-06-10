const REACT_CDN = 'https://unpkg.com/react@18/umd/react.production.min.js'
const REACT_DOM_CDN = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
const BABEL_CDN = 'https://unpkg.com/@babel/standalone/babel.min.js'
const TAILWIND_CDN = 'https://cdn.tailwindcss.com'

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
    <script src="${REACT_CDN}"></script>
    <script src="${REACT_DOM_CDN}"></script>
    <script src="${BABEL_CDN}"></script>
    <script src="${TAILWIND_CDN}"></script>
    <style>
      html, body, #root { height: 100%; }
      body { margin: 0; }
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
