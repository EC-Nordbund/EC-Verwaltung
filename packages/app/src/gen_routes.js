import cmp1 from '@/pages/login.route.vue'
import cmp2 from '@/pages/_.route.vue'
import cmp3 from '@/pages/_/404.route.vue'
import cmp4 from '@/pages/_/ak/_.route.vue'
import cmp5 from '@/pages/_/ak/_id/_.route.vue'
import cmp6 from '@/pages/_/anmeldungen/_.route.vue'
import cmp7 from '@/pages/_/anmeldungen/_id/_.route.vue'
import cmp8 from '@/pages/_/anmeldungen/_id/_/finanzen.route.vue'
import cmp9 from '@/pages/_/anmeldungen/_id/_/home.route.vue'
import cmp10 from '@/pages/_/anmeldungen/_id/_/sonstiges.route.vue'
import cmp11 from '@/pages/_/dublikate/adressen/_.route.vue'
import cmp12 from '@/pages/_/dublikate/adressen/_idA/_.route.vue'
import cmp13 from '@/pages/_/dublikate/adressen/_idA/_idB/_.route.vue'
import cmp14 from '@/pages/_/dublikate/personen/_.route.vue'
import cmp15 from '@/pages/_/dublikate/personen/_idA/_.route.vue'
import cmp16 from '@/pages/_/dublikate/personen/_idA/_idB/_.route.vue'
import cmp17 from '@/pages/_/home.route.vue'
import cmp18 from '@/pages/_/organisationen/_.route.vue'
import cmp19 from '@/pages/_/organisationen/_id/_.route.vue'
import cmp20 from '@/pages/_/organisationen/_id/_/home.route.vue'
import cmp21 from '@/pages/_/organisationen/_id/_/veranstaltungen.route.vue'
import cmp22 from '@/pages/_/organisationen/_id/_/veranstaltungsorte.route.vue'
import cmp23 from '@/pages/_/personen/_.route.vue'
import cmp24 from '@/pages/_/personen/_id/_.route.vue'
import cmp25 from '@/pages/_/personen/_id/_/home.route.vue'
import cmp26 from '@/pages/_/personen/_id/_/sonstiges.route.vue'
import cmp27 from '@/pages/_/personen/_id/_/veranstaltungen.route.vue'
import cmp28 from '@/pages/_/sonstiges/admin.route.vue'
import cmp29 from '@/pages/_/sonstiges/datenschutz.route.vue'
import cmp30 from '@/pages/_/sonstiges/drucken.route.vue'
import cmp31 from '@/pages/_/sonstiges/impressum.route.vue'
import cmp32 from '@/pages/_/sonstiges/profil.route.vue'
import cmp33 from '@/pages/_/veranstaltungen/_.route.vue'
import cmp34 from '@/pages/_/veranstaltungen/_id/_.route.vue'
import cmp35 from '@/pages/_/veranstaltungen/_id/_/anmeldungen.route.vue'
import cmp36 from '@/pages/_/veranstaltungen/_id/_/finanzen.route.vue'
import cmp37 from '@/pages/_/veranstaltungen/_id/_/home.route.vue'
import cmp38 from '@/pages/_/veranstaltungsort/_.route.vue'
import cmp39 from '@/pages/_/veranstaltungsort/_id/_.route.vue'
import cmp40 from '@/pages/_/veranstaltungsort/_id/_/home.route.vue'
import cmp41 from '@/pages/_/veranstaltungsort/_id/_/veranstaltungen.route.vue'
export default [{"path":"login","component":cmp1},{"path":"","component":cmp2,"children":[{"path":"404","component":cmp3},{"path":"ak","children":[{"path":"","component":cmp4},{"path":":id","children":[{"path":"","component":cmp5},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"anmeldungen","children":[{"path":"","component":cmp6},{"path":":id","children":[{"path":"","component":cmp7,"children":[{"path":"finanzen","component":cmp8},{"path":"home","component":cmp9},{"path":"sonstiges","component":cmp10},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}]},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"dublikate","children":[{"path":"adressen","children":[{"path":"","component":cmp11},{"path":":idA","children":[{"path":"","component":cmp12},{"path":":idB","children":[{"path":"","component":cmp13},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"personen","children":[{"path":"","component":cmp14},{"path":":idA","children":[{"path":"","component":cmp15},{"path":":idB","children":[{"path":"","component":cmp16},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"home","component":cmp17},{"path":"organisationen","children":[{"path":"","component":cmp18},{"path":":id","children":[{"path":"","component":cmp19,"children":[{"path":"home","component":cmp20},{"path":"veranstaltungen","component":cmp21},{"path":"veranstaltungsorte","component":cmp22},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}]},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"personen","children":[{"path":"","component":cmp23},{"path":":id","children":[{"path":"","component":cmp24,"children":[{"path":"home","component":cmp25},{"path":"sonstiges","component":cmp26},{"path":"veranstaltungen","component":cmp27},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}]},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"sonstiges","children":[{"path":"admin","component":cmp28},{"path":"datenschutz","component":cmp29},{"path":"drucken","component":cmp30},{"path":"impressum","component":cmp31},{"path":"profil","component":cmp32},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"veranstaltungen","children":[{"path":"","component":cmp33},{"path":":id","children":[{"path":"","component":cmp34,"children":[{"path":"anmeldungen","component":cmp35},{"path":"finanzen","component":cmp36},{"path":"home","component":cmp37},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}]},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"veranstaltungsort","children":[{"path":"","component":cmp38},{"path":":id","children":[{"path":"","component":cmp39,"children":[{"path":"home","component":cmp40},{"path":"veranstaltungen","component":cmp41},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}]},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}],"component":{"render":(h) => h('router-view')}},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}]},{"path":"*","redirect":(to) => ({path: '/404', query: {prev: to.fullPath}})}]