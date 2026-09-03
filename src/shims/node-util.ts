/**
 * Minimal-Ersatz für Node's `util` im Browser-Build (siehe vite.config.ts).
 *
 * Gebraucht wird das nur von `elementtree`, einer Abhängigkeit von
 * `xlsx-template` (TN-Listen) — und daraus ausschließlich `inherits`.
 * Das npm-Paket `util` wäre die naheliegende Alternative, greift beim
 * Laden aber auf `process.env` zu und bräuchte dafür einen globalen
 * process-Shim; den wollen wir der übrigen App nicht unterschieben.
 */
export function inherits(ctor: any, superCtor: any) {
  if (!ctor || !superCtor) return
  ctor.super_ = superCtor
  Object.setPrototypeOf(ctor.prototype, superCtor.prototype)
}

export default { inherits }
