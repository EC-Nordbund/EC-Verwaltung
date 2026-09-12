<template lang="pug">
.d-flex.justify-center.align-center(style='height: 200px')
  v-progress-circular(indeterminate, color='primary')
</template>

<script setup lang="ts">
import { useRouter } from '../../../../../plugins/router'

/**
 * /dublikate/personen/:idA — eine einzelne ID ohne Partner.
 *
 * Diese Route existierte als leerer Platzhalter. Eine eigene Ansicht braucht sie
 * nicht: sinnvoll ist "zeig mir die Vorschläge zu dieser Person", und das kann
 * die Liste schon. Also leitet sie mit gesetztem Filter dorthin weiter — ohne
 * zusätzlichen Endpunkt und ohne die Listenlogik zu verdoppeln.
 *
 * Damit ist die Route auch verlinkbar, etwa künftig von der Personenseite aus.
 */
const { router, route } = useRouter()

router.replace({
  path: '/dublikate/personen',
  query: {
    person: route.value.params.idA as string,
    prev: route.value.query.prev
  }
})
</script>
