/**
 * Minimal-Ersatz für Node's `stream` im Browser-Build (siehe vite.config.ts).
 *
 * `sax` (über elementtree/xlsx-template, TN-Listen) leitet daraus nur seine
 * SAXStream-Klasse ab. Genutzt wird ausschließlich `sax.parser()`, der
 * Stream-Zweig läuft nie — er muss lediglich definiert sein. sax hat dafür
 * selbst einen Fallback, der aber nicht greift: Vites Browser-Stub für
 * `stream` wirft beim require nicht, sondern liefert `Stream: undefined`.
 */
export class Stream {}

export default { Stream }
