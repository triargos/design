import { Prose } from '~/components/ui/prose';

// Sanitize stored HTML before it reaches the page (DOMPurify or the server's sanitizer); this string is already safe.
const DOCUMENT_HTML =
  '<h2>Meeting notes</h2><p>We agreed to ship the <em>client portal</em> in two steps.</p><ul><li><p>Step 1: read-only documents</p></li><li><p>Step 2: comments and uploads</p></li></ul><p>Next review: <strong>Friday</strong>.</p>';

/** Stored rich text (here TipTap HTML, which wraps each list item in a `<p>`) rendered into `Prose`. */
export function ProseRenderedHtml() {
  return <Prose className='max-w-md' dangerouslySetInnerHTML={{ __html: DOCUMENT_HTML }} />;
}
