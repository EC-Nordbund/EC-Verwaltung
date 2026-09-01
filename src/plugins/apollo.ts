import {
  ApolloClient,
  InMemoryCache,
  createHttpLink
} from '@apollo/client/core'
import gql from 'graphql-tag'
import { API_BASE } from './apiBase'

const cache = new InMemoryCache()
const link = createHttpLink({
  uri: `${API_BASE}/graphql`
})
const client = new ApolloClient({
  cache,
  link
})

export function useApollo() {
  return {
    client,
    gql
  }
}
