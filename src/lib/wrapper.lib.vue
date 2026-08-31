<template lang="pug">
v-card(
  :style='{ height: h, display: "grid", gridTemplateRows: "auto " + (hasHeader ? "auto " : "") + "1fr " + (hasNav ? (showNav ? "auto" : "20px") : "") }'
)
  v-card-title
    v-btn(
      icon,
      v-if='hasXBtn',
      @click='goPrev',
      :disabled='!route.query.prev'
    )
      v-icon close
    v-spacer
    h1(v-font, v-primary) {{ title }}
    v-spacer
    //- v-speed-dial(direction="left" v-if="hasDial")
    template(v-if='hasDial')
      v-bottom-sheet(v-if='hasSheet', v-model='sheetOpen')
        template(#activator='{ props: activatorProps }')
          v-btn(icon, v-bind='activatorProps')
            v-icon apps
        v-list
          slot(name='sheet')
          v-list-item(
            v-for='item in sheet',
            :key='item.label',
            @click='sheetOpen = false; item.click(item)',
            :disabled='item.disabled'
          )
            template(#prepend)
              v-icon {{ item.icon }}
            v-list-item-title {{ item.label }}
      ec-lesezeichen-add(:title='title', :subTitle='subTitle')
      v-btn(icon, v-if='hasReload', @click='emit("reload")')
        v-icon replay
      slot(name='menu')
  div(v-if='hasHeader')
    slot(name='header')
  v-card-text(style='overflow-y: auto', v-if='!hasRouterView')
    slot
  slot(v-if='hasRouterView')
  //- Bewusst KEINE v-bottom-navigation: die ist in Vuetify 4 ein Layout-Item
  //- (fixiert am App-Rand + verschiebt v-main-Padding bei jedem Toggle).
  //- Stattdessen In-Card-Leiste wie in Vuetify 1.5.
  v-card-actions(@mouseover='openNav', v-if='hasNav')
    .d-flex.justify-center.flex-grow-1(v-show='showNav')
      v-btn(
        v-for='item in nav',
        :key='item.label',
        variant='text',
        stacked,
        size='small',
        :to='{ path: item.to, query: { prev: route.query.prev } }'
      )
        v-icon {{ item.icon }}
        span {{ item.label }}
  slot(name='dialogs')
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '../plugins/router'

interface SheetItem {
  label: string
  icon: string
  click: (item: SheetItem) => void
  disabled?: boolean
}

interface NavItem {
  label: string
  icon: string
  to: string
}

withDefaults(
  defineProps<{
    hasXBtn?: boolean
    hasDial?: boolean
    hasReload?: boolean
    hasSheet?: boolean
    hasNav?: boolean
    hasHeader?: boolean
    hasRouterView?: boolean
    title?: string
    subTitle?: string
    sheet?: SheetItem[]
    nav?: NavItem[]
  }>(),
  {
    hasXBtn: false,
    hasDial: false,
    hasReload: false,
    hasSheet: false,
    hasNav: false,
    hasHeader: false,
    hasRouterView: false,
    title: 'Loading...',
    subTitle: '',
    sheet: () => [],
    nav: () => []
  }
)

const emit = defineEmits(['reload'])

const { router, route } = useRouter()

// Bekannte Alt-Schwäche (bewusst 1:1 übernommen): Höhe wird einmalig beim
// Setup aus window.innerHeight berechnet, nicht resize-reaktiv.
const h = window.innerHeight - 110 + 'px'
const showNav = ref(false)
const sheetOpen = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function goPrev() {
  router.push(route.value.query.prev as string)
}

function openNav() {
  showNav.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    showNav.value = false
  }, 2000)
}

onMounted(() => {
  openNav()
})
</script>
