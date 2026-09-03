import type { ApolloClient } from '@apollo/client/core'
import gql from 'graphql-tag'

/**
 * Generierung der TN-Listen (Küche/Leiter/Mitarbeiter/Zuschüsse/Spezial-MA)
 * aus den xlsx-Vorlagen in `public/templates`.
 *
 * Die Funktion stammt aus dem alten Verwaltungs-Stand (Branch `old-version`,
 * ehemals `src/tnList.ts`) und wurde beim Umbau auf Rollup/Vite nie
 * mitgenommen — im Menü blieb dadurch nur noch "Alle" übrig.
 */

export interface TnListTemplate {
  name: string
  label: string
}

// Relativ statt absolut (früher fest auf verwaltung.ec-nordbund.de): so
// funktionieren die Listen auch im Dev-Server und in Preview-Deployments.
const TEMPLATE_BASE = `${import.meta.env.BASE_URL}templates`

const TN_LIST_QUERY = gql`
  query ($authToken: String!, $veranstaltungsID: Int!) {
    veranstaltung(authToken: $authToken, veranstaltungsID: $veranstaltungsID) {
      veranstaltungsID
      bezeichnung
      kurzBezeichnung
      begin {
        german
        input
      }
      ende {
        german
      }
      hauptleiter {
        person {
          personID
          vorname
          nachname
        }
      }
      minTNAlter
      maxTNAlter
      anzahlPlaetze
      anzahlPlaetzeW
      anzahlPlaetzeM
      preisNormal
      preisLastMinute
      preisFruehbucher
      fruehbucherBis {
        german
      }
      lastMinuteAb {
        german
      }
      kannVorortBezahltWerden
      hatGWarteliste
      veranstaltungsort {
        bezeichnung
        strasse
        plz
        ort
        land
      }
      anmeldungen {
        anmeldeID
        position
        person {
          vorname
          nachname
          geschlecht
          gebDat {
            input
            german
          }
        }
        adresse {
          strasse
          plz
          ort
        }
        telefon {
          telefon
        }
        email {
          eMail
        }
        bemerkungen
        gesundheitsinformationen
        lebensmittelAllergien
        vegetarisch
        radfahren
        schwimmen
        fahrgemeinschaften
        klettern
        sichEntfernen
        bootFahren
        wartelistenPlatz
        anmeldeZeitpunkt {
          german
          day
          month
          year
        }
        extra_json
      }
    }
  }
`

/**
 * xlsx-template ist eine CJS-Node-Bibliothek. Ihre Node-Bezüge (`path`,
 * `util`, `stream`) löst vite.config.ts über Aliase auf; bleibt `Buffer`,
 * das sie für eine Typprüfung der Eingabe braucht.
 *
 * Die Reihenfolge ist wichtig: erst importieren, dann shimmen. Das
 * mitgelieferte jszip entscheidet beim Laden anhand von `typeof Buffer`,
 * ob es mit Node-Buffern oder mit Uint8Array arbeitet — ein vorher
 * gesetzter Shim schickt es in den Node-Pfad und es scheitert mit
 * "Buffer is not a constructor".
 *
 * Der Import ist dynamisch, damit die ~200 kB nur beim tatsächlichen
 * Listen-Export geladen werden.
 */
async function loadXlsxTemplate() {
  const mod = await import('xlsx-template')
  const g = globalThis as unknown as {
    Buffer?: { isBuffer(v: unknown): boolean }
  }
  if (!g.Buffer) {
    g.Buffer = { isBuffer: () => false }
  }
  return (mod as any).default ?? mod
}

export async function getTemplates(): Promise<TnListTemplate[]> {
  const res = await fetch(`${TEMPLATE_BASE}/list.json`)
  if (!res.ok) {
    throw new Error(`Vorlagenliste nicht gefunden (HTTP ${res.status}).`)
  }
  return res.json()
}

export async function generate(
  veranstaltungsID: number,
  template: string,
  authToken: string,
  apolloClient: ApolloClient<any>,
  wlistFilter: (wlist: number) => boolean,
  variante = ''
) {
  const res = await fetch(`${TEMPLATE_BASE}/${template}.xlsx`)
  if (!res.ok) {
    throw new Error(
      `Vorlage "${template}" nicht gefunden (HTTP ${res.status}).`
    )
  }
  const templateData = await res.arrayBuffer()

  const XlsxTemplate = await loadXlsxTemplate()
  const instance = new XlsxTemplate(templateData)

  const replData = await apolloClient
    .query({
      query: TN_LIST_QUERY,
      variables: { authToken, veranstaltungsID },
      fetchPolicy: 'no-cache'
    })
    .then((v: any) => v.data.veranstaltung)
    .then((v: any) => ({
      ...v,
      vOrtLocation: `${v.veranstaltungsort.plz} ${v.veranstaltungsort.ort} (${v.veranstaltungsort.land})`,
      anmeldungen: v.anmeldungen
        .filter((an: any) => wlistFilter(an.wartelistenPlatz))
        .map((h: any, id: number) => ({
          id,
          ...h,
          empty: '',
          m: h.person.geschlecht === 'm' ? 'X' : '',
          w: h.person.geschlecht === 'w' ? 'X' : '',
          older27:
            dateDiffInYears(h.person.gebDat.input, v.begin.input) > 27
              ? 'X'
              : '',
          betreuer: h.position > 1 ? 'X' : ''
        }))
    }))

  instance.substitute(1, replData)
  const resultList = instance.generate({ type: 'arraybuffer' })

  // begin.german ist "DD.MM.YYYY" -> [2] ist das Jahr (der alte Code griff
  // auf [3] zu und schrieb deshalb "undefined" in den Dateinamen).
  const jahr = String(replData.begin?.german ?? '').split('.')[2] ?? ''
  const kurz = replData.kurzBezeichnung || replData.veranstaltungsID

  saveByteArray(
    ['TN-Liste', template, `${kurz}-${jahr}`, variante]
      .filter(Boolean)
      .join('.') + '.xlsx',
    resultList
  )
}

export function saveByteArray(
  reportName: string,
  byte: ArrayBuffer,
  word = false
) {
  const blob = new Blob([byte], {
    type: word
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const link = document.getElementById('ec-download') as HTMLAnchorElement
  const url = window.URL.createObjectURL(blob)
  link.href = url
  link.download = reportName
  link.click()
  // Ohne revoke bleibt der Blob bis zum Reload im Speicher
  setTimeout(() => window.URL.revokeObjectURL(url), 10000)
}

function dateDiffInYears(dateoldS: string, datenewS: string) {
  const dateold = new Date(dateoldS)
  const datenew = new Date(datenewS)
  let diff = datenew.getFullYear() - dateold.getFullYear()
  const mold = dateold.getMonth()
  const mnew = datenew.getMonth()
  if (mold > mnew || (mold === mnew && dateold.getDate() > datenew.getDate())) {
    diff--
  }
  return diff
}
