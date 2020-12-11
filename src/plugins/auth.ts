import Vue from 'vue';
import gql from 'graphql-tag';


export default (router: any, createVue: any) => {
  const auth = {
    authToken: '',
    logout: -1
  };

  Vue.prototype.$authToken = () => {
    return auth.authToken;
  };

  Vue.prototype.$setAuthToken = (authToken: string, setTime = true) => {
    auth.authToken = authToken;
    if (!setTime) {
      return
    }
    return fetch('https://api.ec-nordbund.de/time').then(v => v.json()).then(v => v.time).then(v => v + 12 * 60 * 60 * 1000).then(time => {
      localStorage.set('logoutTime', time.toString())
      localStorage.set('authToken', authToken, { expires: 1 });
      auth.logout = time
    })
  };

  window.addEventListener('storage', (ev) => {
    if (ev.storageArea !== localStorage) return

    if (localStorage.getItem('authToken') !== auth.authToken && localStorage.getItem('authToken') !== null) {
      auth.authToken = localStorage.getItem('authToken')!
      auth.logout = parseInt(localStorage.getItem('logoutTime')!)
    }
  })

  Vue.prototype.$logoutIn = async () => {
    if (auth.logout === -1) {
      return null
    }

    return auth.logout - (await fetch('https://api.ec-nordbund.de/time').then(v => v.json()).then(v => v.time))
  }


  const at = localStorage.getItem('authToken');

  if (at) {
    Vue.prototype.$apolloClient.query({
      query: gql`
        query($at:String!) {
          person(personID: 0, authToken: $at) {
            personID
          }
        }
      `,
      variables: {
        at
      }
    }).then(() => {
      Vue.prototype.$setAuthToken(at);
      auth.logout = parseInt(localStorage.getItem('logoutTime')!)
    }).catch(() => {
      localStorage.remove('authToken');
    }).then(() => {
      createVue();
    });
  } else {
    createVue();
  }
};
