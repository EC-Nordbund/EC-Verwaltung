// Ersatz für das frühere Vue.prototype.$empty (No-op, z. B. für .catch(empty))
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const empty = () => {}

/**
 * Wirft den Antworttext, wenn die Anfrage fehlgeschlagen ist.
 *
 * Geprüft wird `res.ok` (alle 2xx) und nicht mehr `status === 200`: die API
 * antwortet beim Anlegen mit 201 Created, und mit der alten Prüfung landete
 * ausgerechnet der Erfolgsfall im Fehlerdialog — inklusive des
 * Antwort-JSONs als vermeintliche Fehlermeldung ("Anlegen fehlgeschlagen!
 * {"portalUserID":2}"), obwohl der Vorgang durchgelaufen war.
 */
export const errorHandler = async (res: Response) => {
  if (!res.ok) {
    throw await res.text()
  }
  return res
}
