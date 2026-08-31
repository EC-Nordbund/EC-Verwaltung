// Bugfix (dokumentiert): früher gab es zwei parallele APIs —
// $notifikation mit hartkodiertem, gehashtem Icon-Pfad aus einem alten
// Build (/img/ec-logo-512.361ca3c3.png, kaputt) und useNotification mit
// CommonJS-require. Jetzt EIN Composable mit importiertem Asset.
import icon from '../icons/ec-logo-512.png'

export function useNotification() {
  return {
    createNotification({ title, body }: { title: string; body: string }) {
      if (Notification.permission === 'granted') {
        return new Notification(title, {
          body,
          icon
        })
      }
    }
  }
}

// Früher Modul-Seiteneffekt beim Import — jetzt explizit von main.ts
// aufgerufen.
export function setupNotifications() {
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }
}
