<template lang="pug">
v-card-text(style='overflow: auto')
  v-list(lines='two')
    v-list-item(v-if='data.vegetarisch')
      template(#prepend)
        v-icon person
      v-list-item-title Vegetarier
    v-list-item(v-else)
      template(#prepend)
        v-icon person
      v-list-item-title Kein Vegetarier
    v-list-item
      template(#prepend)
        v-icon person
      template(#append)
        v-btn(icon, @click='showAll("lebensmittelAllergien")')
          v-icon search
      v-list-item-title {{ data.lebensmittelAllergien || "N/A" }}
      v-list-item-subtitle Lebensmittelallergien
    v-divider
    v-list-item
      template(#prepend)
        v-icon person
      template(#append)
        v-btn(icon, @click='showAll("gesundheitsinformationen")')
          v-icon search
      v-list-item-title {{ data.gesundheitsinformationen || "N/A" }}
      v-list-item-subtitle Gesundheitsinformationen
    v-list-item
      template(#prepend)
        v-icon person
      template(#append)
        v-btn(icon, @click='showAll("bemerkungen")')
          v-icon search
      v-list-item-title {{ data.bemerkungen || "N/A" }}
      v-list-item-subtitle Bemerkungen
    v-divider
    v-list-item
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.radfahren ? "Rad fahren, " : "" }} {{ data.klettern ? "Klettern, " : "" }} {{ data.bootFahren ? "Boot fahren, " : "" }} {{ data.schwimmen > 0 ? "Schwimmen, " : "" }} {{ data.fahrgemeinschaften ? "Fahrgemeinschaften" : "" }}
      v-list-item-subtitle Erlaubnisse
    v-list-item(v-if='data.schwimmen > 0')
      template(#prepend)
        v-icon person
      v-list-item-title {{ schwimmStufen[data.schwimmen - 1] }}
      v-list-item-subtitle Schwimmen
    template(v-if='data.wartelistenPlatz < 0')
      v-divider
      v-list-item
        template(#prepend)
          v-icon person
        template(#append)
          v-btn(icon, @click='showAll("kommentarAbmeldung")')
            v-icon search
        v-list-item-title {{ data.kommentarAbmeldung || "N/A" }}
        v-list-item-subtitle Kommentar zur Abmeldung
      v-list-item
        template(#prepend)
          v-icon person
        template(#append)
          v-btn(icon, @click='showAll("wegDerAbmeldung")')
            v-icon search
        v-list-item-title {{ data.wegDerAbmeldung || "N/A" }}
        v-list-item-subtitle Weg der Abmeldung
    template(v-if='data.extra_json && data.extra_json.length > 2')
      v-divider
      p Extra Daten:
      v-treeview(
        :items='extraJsonTree',
        item-title='name',
        v-if='data.extra_json && data.extra_json.length > 2'
      )
      //-   v-list-item-title {{data.extra_json}}
      //-   v-list-item-subtitle Sonstige Felder
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDialog } from '../../../../../plugins/dialog'

const props = withDefaults(defineProps<{ data?: any }>(), {
  data: () => ({ person: {} })
})

const { notifyInfo } = useDialog()

const schwimmStufen = [
  'Nichtschwimmer',
  'Mittelmäßiger Schwimmer',
  'Guter Schwimmer'
]

function showAll(keyName: string) {
  notifyInfo(props.data[keyName] || 'N/A')
}

// Hieß früher `h()` — umbenannt wegen Namenskollision mit Vues
// Render-Funktion `h` in <script setup>.
function jsonToTreeItems(v: any): any[] {
  const res: any[] = []

  Object.keys(v).forEach((key) => {
    if (typeof v[key] === 'object') {
      res.push({
        name: key + ':',
        children: jsonToTreeItems(v[key])
      })
    } else {
      res.push({
        name: key + ': ' + v[key]
      })
    }
  })

  return res
}

// JSON.parse gehört nicht ins Template — als computed gekapselt.
const extraJsonTree = computed(() => {
  if (!props.data.extra_json || props.data.extra_json.length <= 2) {
    return []
  }

  return jsonToTreeItems(JSON.parse(props.data.extra_json))
})
</script>
