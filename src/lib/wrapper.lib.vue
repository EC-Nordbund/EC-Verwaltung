<template lang="pug">
v-card(
  :style='{ height: h, display: "grid", gridTemplateRows: "auto " + (hasHeader ? "auto " : "") + "1fr " + (hasNav ? (showNav ? "auto" : "20px") : "") }'
)
  v-card-title
    v-btn(
      icon,
      v-if='hasXBtn',
      @click='$router.push($route.query.prev)',
      :disabled='!$route.query.prev'
    )
      v-icon close
    v-spacer
    h1(v-font, v-primary) {{ title }}
    v-spacer
    //- v-speed-dial(direction="left" v-if="hasDial")
    template(v-if='hasDial')
      v-bottom-sheet(v-if='hasSheet', v-model='sheetOpen')
        v-btn(icon, slot='activator')
          v-icon apps
        v-list
          slot(name='sheet')
          v-list-tile(
            v-for='item in sheet',
            :key='item.label',
            @click='sheetOpen = false; item.click(item)',
            :disabled='item.disabled'
          )
            v-list-tile-action
              v-icon {{ item.icon }}
            v-list-tile-title {{ item.label }}
      ec-lesezeichen-add(:title='title', :subTitle='subTitle')
      v-btn(icon, v-if='hasReload', @click='$emit("reload")')
        v-icon replay
      slot(name='menu')
  div(v-if='hasHeader')
    slot(name='header')
  v-card-text(style='overflow-y: auto', v-if='!hasRouterView')
    slot
  slot(style='overflow-y: auto', v-if='hasRouterView')
  v-card-actions(@mouseover='openNav', v-if='hasNav')
    v-bottom-nav.elevation-0(:value='showNav')
      v-btn(
        v-for='item in nav',
        :key='item.label',
        :to='{ path: item.to, query: { prev: $route.query.prev } }'
      )
        span {{ item.label }}
        v-icon {{ item.icon }}
  slot(name='dialogs')
</template>
<script lang="ts">
import { defineComponent, ref, onMounted } from '@vue/composition-api'

export default defineComponent({
  name: 'Wrapper',
  props: {
    hasXBtn: {
      type: Boolean,
      default: false
    },
    hasDial: {
      type: Boolean,
      default: false
    },
    hasReload: {
      type: Boolean,
      default: false
    },
    hasSheet: {
      type: Boolean,
      default: false
    },
    hasNav: {
      type: Boolean,
      default: false
    },
    hasHeader: {
      type: Boolean,
      default: false
    },
    hasRouterView: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Loading...'
    },
    subTitle: {
      type: String,
      default: ''
    },
    sheet: {
      type: Array,
      default: () => []
    },
    nav: {
      type: Array,
      default: () => []
    }
  },
  setup() {
    const h = window.innerHeight - 110 + 'px'
    const showNav = ref(false)
    const sheetOpen = ref(false)
    let timer: any

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

    return {
      h,
      sheetOpen,
      showNav,
      openNav
    }
  }
})
</script>
