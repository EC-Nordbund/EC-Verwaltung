import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core'
import gql from 'graphql-tag'
import Vue from 'vue'
const cache = new InMemoryCache()
const link = createHttpLink({
  uri: 'https://api.ec-nordbund.de/graphql'
})
Vue.prototype.$gql = gql
Vue.prototype.$apolloClient = new ApolloClient({
  cache,
  link
})
