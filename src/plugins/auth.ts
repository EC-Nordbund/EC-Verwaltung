import Vue from 'vue';
import gql from 'graphql-tag';
import VueRouter from 'vue-router';


export default (router: VueRouter, createVue: any) => {
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
      return;
    }
    return fetch('https://api.ec-nordbund.de/time').then((v) => v.json()).then((v) => v.time).then((v) => v + 12 * 60 * 60 * 1000).then((time) => {
      localStorage.setItem('logoutTime', time.toString());
      localStorage.setItem('authToken', authToken);
      auth.logout = time;
    });
  };

  window.addEventListener('storage', (ev) => {
    if (ev.storageArea !== localStorage) { return; }

    if (localStorage.getItem('authToken') !== auth.authToken && localStorage.getItem('authToken') !== null) {
      auth.authToken = localStorage.getItem('authToken')!;
      auth.logout = parseInt(localStorage.getItem('logoutTime')!);

      if (auth.authToken === '') {
        router.push('/login');
      }
    }
  });

  Vue.prototype.$logoutIn = async () => {
    if (auth.logout === -1) {
      return null;
    }

    const time = auth.logout - (await fetch('https://api.ec-nordbund.de/time').then((v) => v.json()).then((v) => v.time));

    if (time < 0) {
      auth.authToken = '';
      auth.logout = -1;
      router.push('/login');
    }

    return time;
  };

  Vue.prototype.$logout = () => {
    auth.authToken = '';
    auth.logout = -1;
    localStorage.setItem('logoutTime', '-1');
    localStorage.setItem('authToken', '');
    router.push('/login');
  };


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
      auth.logout = parseInt(localStorage.getItem('logoutTime')!);
    }).catch(() => {
      localStorage.removeItem('authToken');
    }).then(() => {
      createVue();
    });
  } else {
    createVue();
  }
};
