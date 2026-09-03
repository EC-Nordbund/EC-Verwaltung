type filename = string

declare module '*.png' {
  const value: filename
  export default value
}

// xlsx-template bringt keine Typen mit; genutzt wird nur substitute/generate.
declare module 'xlsx-template' {
  export default class XlsxTemplate {
    constructor(data?: ArrayBuffer | Uint8Array)
    substitute(sheet: number | string, values: Record<string, unknown>): void
    generate(options: { type: 'arraybuffer' }): ArrayBuffer
    generate(options?: { type?: string }): unknown
  }
}
