/**
 * Basis-URL der API. Wird beim Build durch das replace-Rollup-Plugin ersetzt:
 * Standard ist https://api.ec-nordbund.de, überschreibbar über die
 * Umgebungsvariable API_BASE (z. B. API_BASE=http://localhost:4000 yarn serve).
 */
declare const __API_BASE__: string

export const API_BASE = __API_BASE__
