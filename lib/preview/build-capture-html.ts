import { buildPreviewHtml } from './build-html'

const HTML2CANVAS_CDN = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js'

/** Wait for fonts/images/Tailwind JIT before snapshotting. */
const CAPTURE_DELAY_MS = 3200
const CAPTURE_WIDTH = 1280
const CAPTURE_HEIGHT = 800
const JPEG_QUALITY = 0.82

/**
 * Extends the standard preview document with an html2canvas-based capture
 * script. Once the page settles, it snapshots the viewport and posts a
 * `promptsite:thumbnail` message (JPEG data URL) to the parent window.
 * Designed for a hidden, sandboxed (allow-scripts) iframe.
 */
export function buildCaptureHtml(code: string): string {
  const base = buildPreviewHtml(code)

  const captureScript = `
    <script src="${HTML2CANVAS_CDN}"></script>
    <script>
      window.addEventListener('load', function () {
        setTimeout(function () {
          if (typeof html2canvas !== 'function') {
            parent.postMessage({ type: 'promptsite:thumbnail-error' }, '*');
            return;
          }
          html2canvas(document.body, {
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            width: ${CAPTURE_WIDTH},
            height: ${CAPTURE_HEIGHT},
            windowWidth: ${CAPTURE_WIDTH},
            windowHeight: ${CAPTURE_HEIGHT},
            scale: 0.75,
            logging: false,
            imageTimeout: 4000,
          })
            .then(function (canvas) {
              var dataUrl = canvas.toDataURL('image/jpeg', ${JPEG_QUALITY});
              parent.postMessage({ type: 'promptsite:thumbnail', dataUrl: dataUrl }, '*');
            })
            .catch(function () {
              parent.postMessage({ type: 'promptsite:thumbnail-error' }, '*');
            });
        }, ${CAPTURE_DELAY_MS});
      });
    </script>
  </body>`

  return base.replace('</body>', captureScript)
}
