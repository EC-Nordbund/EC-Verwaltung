import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import gql from 'graphql-tag';
import Vue from 'vue';

// Instantiate required constructor fields
const cache = new InMemoryCache();
const link = createHttpLink({
  uri: 'https://api.tmp.ec-nordbund.de/graphql',
});

Vue.prototype.$gql = gql;
Vue.prototype.$apolloClient = new ApolloClient({
  // Provide required constructor fields
  cache: cache,
  link: link
});
