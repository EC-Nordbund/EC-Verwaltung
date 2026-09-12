<template lang="pug">
ec-wrapper(
  v-bind='config',
  hasXBtn,
  hasDial,
  hasReload,
  @reload='loadData'
)
  v-progress-linear(v-if='loading', indeterminate, color='primary')

  v-alert.ma-2(v-if='fehler', type='error', variant='tonal')
    | {{ fehler }}
    template(#append)
      v-btn(variant='text', @click='loadData') Erneut versuchen

  template(v-if='daten')
    v-alert.ma-2(
      :color='scoreColor(daten.stufe)',
      variant='tonal',
      icon='join_full'
    )
      .font-weight-bold
        | Übereinstimmung {{ daten.score }} ({{ daten.stufe }})
        span.text-medium-emphasis(v-if='!daten.imVorschlag')
          |  – unterhalb der Vorschlagsschwelle
      div
        v-chip.ma-1(
          v-for='g in daten.gruende',
          :key='g.code',
          size='small',
          variant='tonal',
          :color='regelInfo(g.code).color'
        )
          v-icon(start, size='x-small') {{ regelInfo(g.code).icon }}
          | {{ g.text }}

    //- Sagt VOR dem Klick, ob der Merge durchgeht. Die API prüft dasselbe
    //- nochmals in der Transaktion — hier geht es darum, dass niemand erst nach
    //- dem Bestätigen erfährt, dass es nicht geht.
    v-alert.ma-2(
      v-if='!daten.kollisionen.mergeMoeglich',
      type='error',
      variant='tonal',
      icon='block'
    )
      .font-weight-bold.mb-1 Zusammenführen ist derzeit nicht möglich:
      ul.ml-4
        li(v-for='(b, i) in daten.kollisionen.blocker', :key='i') {{ b }}

    v-alert.ma-2(
      v-if='daten.ignoriert',
      type='info',
      variant='tonal',
      density='compact',
      icon='link_off'
    )
      | Dieses Paar ist als „kein Duplikat" gespeichert und erscheint nicht in
      | der Vorschlagsliste.

    v-row.ma-0
      v-col(
        v-for='(p, i) in daten.personen',
        :key='p.personID',
        cols='12',
        md='6'
      )
        v-card(
          variant='outlined',
          :color='daten.vorschlagBehalten === p.personID ? "primary" : undefined'
        )
          v-card-title.d-flex.align-center
            span(:class='"g-" + p.geschlecht') {{ p.vorname }} {{ p.nachname }}
            v-spacer
            v-chip(size='small') ID {{ p.personID }}
          v-card-subtitle(v-if='daten.vorschlagBehalten === p.personID')
            v-icon(size='x-small') recommend
            |  Vorschlag: diesen Satz behalten

          v-table(density='compact')
            tbody
              tr(
                v-for='z in zeilen(i)',
                :key='z.label',
                :class='z.diff ? "diff" : ""'
              )
                td.text-medium-emphasis(style='width: 40%') {{ z.label }}
                td
                  div(v-for='(w, k) in z.werte', :key='k') {{ w }}
                  span.text-medium-emphasis(v-if='!z.werte.length') —

          v-card-actions
            v-btn(
              block,
              color='primary',
              variant='flat',
              prepend-icon='merge_type',
              :disabled='busy || !daten.kollisionen.mergeMoeglich',
              :loading='busy',
              @click='mergen(i)'
            ) Diese Person behalten

    .d-flex.justify-center.ga-2.my-4.flex-wrap
      v-btn(
        variant='text',
        prepend-icon='link_off',
        :disabled='busy || daten.ignoriert',
        @click='keinDuplikat'
      ) Kein Duplikat
      v-btn(variant='text', @click='zurueck') Abbrechen

  template(#dialogs)
    ec-dublette-merge(ref='mergeDialog')
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { API_BASE } from '../../../../../../plugins/apiBase'
import { useLogin } from '../../../../../../plugins/auth'
import { useDialog } from '../../../../../../plugins/dialog'
import { useRouter } from '../../../../../../plugins/router'
import { empty, errorHandler } from '../../../../../../helpers'
import {
  formatGebDat,
  formatZeit,
  regelInfo,
  scoreColor
} from '../../../../../../util/dubletten.util'

/**
 * Gegenüberstellung zweier Personen vor dem Zusammenführen.
 *
 * Für die Fälle, in denen die Liste allein nicht reicht — mittlere
 * Übereinstimmung, unterschiedliche Kontaktdaten, Zugänge im Spiel. Die
 * Richtung wird durch den Knopf UNTER der jeweiligen Spalte gewählt: man klickt
 * auf die Person, die bleibt. Kein Auswahlfeld, bei dem man sich vertun kann.
 *
 * Alle Daten kommen aus einem Request (/v6/dubletten/paar/:idA/:idB), der auch
 * den Kollisions-Block mitliefert.
 */

const { authToken } = useLogin()
const { error, notifyInfo } = useDialog()
const { router, route } = useRouter()

const mergeDialog = useTemplateRef<any>('mergeDialog')

const daten = ref<any>(null)
const loading = ref(true)
const fehler = ref<string | null>(null)
const busy = ref(false)

const idA = computed(() => parseInt(route.value.params.idA as string, 10))
const idB = computed(() => parseInt(route.value.params.idB as string, 10))

const config = computed(() => ({
  title: 'Dubletten-Vergleich',
  subTitle: daten.value
    ? `${daten.value.personen[0].vorname} ${daten.value.personen[0].nachname} / ${daten.value.personen[1].vorname} ${daten.value.personen[1].nachname}`
    : `${idA.value} / ${idB.value}`
}))

function kopf() {
  return { authorization: authToken.value }
}

function melde(err: any, titel: string) {
  error({
    text: String(err?.message || err || 'Unbekannter Fehler'),
    title: titel
  })
}

function loadData() {
  loading.value = true
  fehler.value = null
  fetch(`${API_BASE}/v6/dubletten/paar/${idA.value}/${idB.value}`, {
    headers: kopf()
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      daten.value = res
    })
    .catch((err: any) => {
      fehler.value = String(err?.message || err)
      daten.value = null
    })
    .finally(() => {
      loading.value = false
    })
}

/**
 * Baut die Vergleichszeilen einer Spalte.
 *
 * `diff` markiert, wo sich die beiden unterscheiden — verglichen wird
 * normalisiert (klein, getrimmt, Mehrfachwerte sortiert), damit nicht jede
 * Leerzeichen-Abweichung als Unterschied aufleuchtet und die wirklich
 * abweichenden Felder hervorstechen.
 */
function zeilen(index: number) {
  const p = daten.value.personen[index]
  const q = daten.value.personen[1 - index]

  const mk = (
    label: string,
    werte: string[],
    gegen: string[]
  ): { label: string; werte: string[]; diff: boolean } => ({
    label,
    werte,
    diff: norm(werte) !== norm(gegen)
  })

  return [
    mk('Vorname', [p.vorname], [q.vorname]),
    mk('Nachname', [p.nachname], [q.nachname]),
    mk('Geburtsdatum', [formatGebDat(p.gebDat)], [formatGebDat(q.gebDat)]),
    mk(
      'Geschlecht',
      [p.geschlecht === 'm' ? 'männlich' : 'weiblich'],
      [q.geschlecht === 'm' ? 'männlich' : 'weiblich']
    ),
    mk(
      'EC-Kreis',
      [p.ecKreis ? `Kreis ${p.ecKreis}` : '—'],
      [q.ecKreis ? `Kreis ${q.ecKreis}` : '—']
    ),
    mk('Mitgliedsstatus', [String(p.ecMitglied)], [String(q.ecMitglied)]),
    mk(
      'Adressen',
      p.adressen.map(
        (a: any) => `${a.strasse}, ${a.plz} ${a.ort}${a.isOld ? ' (alt)' : ''}`
      ),
      q.adressen.map(
        (a: any) => `${a.strasse}, ${a.plz} ${a.ort}${a.isOld ? ' (alt)' : ''}`
      )
    ),
    mk(
      'E-Mail',
      p.eMails.map((e: any) => `${e.eMail}${e.isOld ? ' (alt)' : ''}`),
      q.eMails.map((e: any) => `${e.eMail}${e.isOld ? ' (alt)' : ''}`)
    ),
    mk(
      'Telefon',
      p.telefone.map((t: any) => `${t.telefon}${t.isOld ? ' (alt)' : ''}`),
      q.telefone.map((t: any) => `${t.telefon}${t.isOld ? ' (alt)' : ''}`)
    ),
    mk(
      'Anmeldungen',
      p.anmeldungen.map(
        (a: any) =>
          `${a.bezeichnung ?? 'Veranstaltung ' + a.veranstaltungsID}${a.abmeldeZeitpunkt ? ' (abgemeldet)' : ''}`
      ),
      q.anmeldungen.map(
        (a: any) =>
          `${a.bezeichnung ?? 'Veranstaltung ' + a.veranstaltungsID}${a.abmeldeZeitpunkt ? ' (abgemeldet)' : ''}`
      )
    ),
    mk(
      'Führungszeugnisse',
      p.fz.map((f: any) => `gesehen am ${formatGebDat(f.gesehenAm)}`),
      q.fz.map((f: any) => `gesehen am ${formatGebDat(f.gesehenAm)}`)
    ),
    mk(
      'Arbeitskreise',
      p.ak.map((a: any) => a.bezeichnung ?? `AK ${a.akID}`),
      q.ak.map((a: any) => a.bezeichnung ?? `AK ${a.akID}`)
    ),
    mk(
      'Tags',
      p.tags.map((t: any) => t.bezeichnung),
      q.tags.map((t: any) => t.bezeichnung)
    ),
    mk('Zugänge', zugaenge(p), zugaenge(q)),
    mk('Notizen', p.notizen ? [p.notizen] : [], q.notizen ? [q.notizen] : []),
    mk('Angelegt', [formatZeit(p.erstellt)], [formatZeit(q.erstellt)]),
    mk(
      'Letzte Änderung',
      [formatZeit(p.letzteAenderung)],
      [formatZeit(q.letzteAenderung)]
    )
  ]
}

function zugaenge(p: any): string[] {
  const v: string[] = []
  if (p.hatVerwaltungsLogin) v.push('Verwaltungs-Login')
  if (p.hatPortalZugang) v.push('Portal-Zugang')
  if (p.verantwortlichFuer?.fz?.length) {
    v.push(`FZ-verantwortlich: Kreis ${p.verantwortlichFuer.fz.join(', ')}`)
  }
  if (p.verantwortlichFuer?.ort?.length) {
    v.push(`ortsverantwortlich: Kreis ${p.verantwortlichFuer.ort.join(', ')}`)
  }
  return v
}

function norm(werte: string[]): string {
  return werte
    .map((w) => String(w).toLowerCase().trim().replace(/\s+/g, ' '))
    .sort()
    .join('|')
}

/** `index` ist die Spalte, deren Person BLEIBEN soll. */
function mergen(index: number) {
  const behalten = daten.value.personen[index]
  const entfernen = daten.value.personen[1 - index]

  mergeDialog.value
    ?.show(behalten, entfernen)
    .then(() => {
      busy.value = true
      return fetch(`${API_BASE}/v6/dubletten/merge`, {
        method: 'POST',
        headers: { ...kopf(), 'content-type': 'application/json' },
        body: JSON.stringify({
          personID_behalten: behalten.personID,
          personID_entfernen: entfernen.personID,
          score: daten.value.score
        })
      })
        .then(errorHandler)
        .then((res) => res.json())
        .then(() => {
          notifyInfo(
            `${entfernen.vorname} ${entfernen.nachname} wurde mit ${behalten.vorname} ${behalten.nachname} zusammengeführt.`
          )
          zurueck()
        })
        .catch((err: any) => melde(err, 'Zusammenführen fehlgeschlagen!'))
        .finally(() => {
          busy.value = false
        })
    })
    .catch(empty)
}

function keinDuplikat() {
  busy.value = true
  fetch(`${API_BASE}/v6/dubletten/kein-duplikat`, {
    method: 'POST',
    headers: { ...kopf(), 'content-type': 'application/json' },
    body: JSON.stringify({ personID_1: idA.value, personID_2: idB.value })
  })
    .then(errorHandler)
    .then(() => {
      notifyInfo('Als kein Duplikat gespeichert.')
      zurueck()
    })
    .catch((err: any) => melde(err, 'Speichern fehlgeschlagen!'))
    .finally(() => {
      busy.value = false
    })
}

function zurueck() {
  const prev = route.value.query.prev as string | undefined
  router.replace(prev || '/dublikate/personen')
}

loadData()
</script>

<style scoped>
/* Abweichende Felder hervorheben; gleiche bleiben ruhig, damit die
   Unterschiede sofort ins Auge fallen (warning-Ton aus dem Theme). */
.diff td {
  background: rgba(255, 193, 7, 0.18);
}
.g-m {
  color: #4697ba;
}
.g-w {
  color: #c243aa;
}
</style>
