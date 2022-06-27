<template lang="pug">
v-app(app, :dark='dark')
  v-toolbar(fixed, app, clipped-left, color='primary')
    v-toolbar-side-icon(v-white, @click='drawer = !drawer')
    //- v-btn(v-white icon @click="$router.back()")
    //-   v-icon undo
    //- v-btn(v-white icon @click="$router.forward()")
    //-   v-icon redo
    v-spacer
    v-avatar(size='60px', style='margin-right: 10px')
      img(src='@/assets/ec-logo-without-bg-64.png')
    span(
      v-white,
      v-font,
      style='font-size: 26px; padding-top: 5px; margin-right: 8px'
    ) Nordbund – Verwaltung
    v-spacer
    ec-lesezeichen-show
    div(style='padding-right: 20px') 
    v-btn(icon, v-white, @click='subscribe')
      v-icon add_alert
    v-btn(icon, v-white, @click='toggleDark')
      v-icon invert_colors
    v-btn(icon, v-white, @click='loginDialog = true')
      span {{ alive }} min
    //- v-btn(icon v-white @click="logout")
    //-   v-icon exit_to_app

  v-navigation-drawer(clipped, app, v-model='drawer')
    v-toolbar.transparent(flat)
      v-list
        v-list-tile(avatar, to='/sonstiges/profil')
          v-list-tile-avatar
            div(
              style='border-radius: 50%; width: 40px; height: 40px; padding: 8px 0',
              v-primary-bg,
              v-black
            )
              | {{ data.person.vorname[0] }}{{ data.person.nachname[0] }}
            //- img(src="https://randomuser.me/api/portraits/men/85.jpg")
          v-list-tile-content
            v-list-tile-title {{ data.person.vorname }} {{ data.person.nachname }} ({{ data.ablaufDatum.german }})
    v-list
      v-list-tile(to='/home')
        v-list-tile-action
          v-icon home
        v-list-tile-title Home
      v-divider
      v-subheader Personen
      v-list-tile(to='/personen')
        v-list-tile-action
          v-icon person
        v-list-tile-title Personen
      v-list-tile(to='/fz')
        v-list-tile-action
          v-icon home
        v-list-tile-title FZ
      v-list-tile(to='/ak')
        v-list-tile-action
          v-icon group
        v-list-tile-title Arbeitskreise
      v-divider
      v-subheader Veranstaltungen
      v-list-tile(to='/anmeldungen')
        v-list-tile-action
          v-icon assignment_ind
        v-list-tile-title Anmeldungen
      v-list-tile(to='/veranstaltungen')
        v-list-tile-action
          v-icon event
        v-list-tile-title Veranstaltungen
      v-list-tile(to='/veranstaltungsort')
        v-list-tile-action
          v-icon home
        v-list-tile-title Veranstaltungsorte
      v-list-tile(to='/organisationen')
        v-list-tile-action
          v-icon library_books
        v-list-tile-title Organisationen
      v-divider
      v-subheader Dublikate
      v-list-tile(to='/dublikate/personen')
        v-list-tile-action
          v-icon person
        v-list-tile-title Personen
      v-list-tile(to='/dublikate/adressen')
        v-list-tile-action
          v-icon home
        v-list-tile-title Adressen
      v-divider
      v-subheader Sonstiges
      v-list-tile(to='/sonstiges/admin')
        v-list-tile-action
          v-icon settings
        v-list-tile-title Administration
      v-list-tile(to='/sonstiges/datenschutz')
        v-list-tile-action
          v-icon security
        v-list-tile-title Datenschutz
      //- v-list-tile(to="/sonstiges/impressum")
      //-   v-list-tile-action
      //-     v-icon menu
      //-   v-list-tile-title Impressum

  v-content
    router-view(
      :key='$route.path',
      style='margin: 5px; width: calc(100% - 10px)'
    )

  v-footer(app, style='padding: 0 10px', fixed, color='secondary')
    v-breadcrumbs(:items='breadcrumbsRouter')
      v-icon(slot='divider', v-white) keyboard_arrow_right
      template(slot='item', slot-scope='props')
        span.disabled(v-white) {{ props.item.text }}
    v-spacer
    span(v-white) Version: {{ version }}
    v-spacer
    v-breadcrumbs(:items='breadcrumbs')
      v-icon(slot='divider', v-white) keyboard_arrow_right
      template(slot='item', slot-scope='props')
        span.disabled(v-white) {{ props.item.text }}
  v-dialog(v-model='loginDialog', width='350px')
    v-card
      v-card-title
        h1(v-font) Anmeldung verlängern
      v-card-text
        v-form(v-model='valid')
          v-tooltip(
            :value='isCapsOn',
            :disabled='!isCapsOn',
            bottom,
            color='info'
          )
            v-text-field(
              slot='activator',
              label='Passwort',
              v-model='password',
              required,
              :autofocus='data.username !== ""',
              :color='isCapsOn && !$route.query.error ? "info" : undefined',
              :append-outer-icon='isCapsOn ? "keyboard_capslock" : undefined',
              :append-icon='showPasword ? "visibility_off" : "visibility"',
              @click:append='() => (showPasword = !showPasword)',
              :type='showPasword ? "text" : "password"',
              @keyup.enter='logIn',
              :rules='[(v) => (!!v ? true : "Ein Password muss angegeben werden!")]'
            )
            span Die Feststelltaste ist aktiviert
      v-card-actions
        v-spacer
        v-btn(
          v-accent-bg,
          v-white,
          :disabled='!valid || loading',
          @click='logIn'
        ) Verlängern
        v-btn(v-accent-bg, v-white, @click='logout') Abmelden
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import pack from '@/plugins/package';
import gql from 'graphql-tag';
import * as save from 'js-cookie';
import { subscribe } from '../plugins/sw';
// ()
@Component({})
export default class EcRootIndex extends Vue {
  private get breadcrumbsRouter(): any[] {
    return this.breadMap(
      this.$route.path
        .split('/')
        .slice(1)
        .map((v) => v[0].toUpperCase() + v.slice(1))
    );
  }
  public static meta = {};
  private password = '';
  private dark = save.get('dark') === 'x';
  private drawer = null;
  private version = pack.version || 'Fehler';
  private breadcrumbs = this.breadMap([
    `© 2017 - ${new Date().getFullYear()}`,
    'EC-Nordbund',
    'T. Krause + S. Krüger'
  ]);
  private loginDialog = false;
  private subscribe = subscribe;

  private data: any = {
    person: { vorname: {}, nachname: {} },
    ablaufDatum: {}
  };

  private loading = false;

  private alive: number = -1;

  private timer: null | NodeJS.Timeout = null;
  private isCapsOn = false;
  private valid = false;
  private showPasword = false;

  public logIn() {
    this.loading = true;
    this.$apolloClient
      .mutate({
        mutation: gql`
          mutation($username: String!, $password: String!) {
            logIn(version: "3.0.0", username: $username, password: $password)
          }
        `,
        variables: {
          password: this.password,
          username: localStorage.getItem('username')
        }
      })
      .then(async (res: any) => {
        // let path = this.$route.query.next || '/home';
        // if (this.$route.query.next === '/404?prev=%2F') {
        //   path = 'home';
        // }
        // save.set('username', this.data.username, { expires: 7 });
        // localStorage.setItem('username', this.data.username);
        await this.$setAuthToken(res.data.logIn);
        // this.$router.push(path as string);
        this.loading = false;
        this.updateAlive();
        this.password = '';
        this.loginDialog = false;
      })
      .catch((err: any) => {
        this.$dialog.error({
          text: err.message,
          title: 'Anmelden fehlgeschlagen!'
        });
        this.loading = false;
      });
  }

  public checkCaps(ev: KeyboardEvent) {
    const key = ev.key;
    if (key.length === 1) {
      this.isCapsOn =
        key.toUpperCase() === key && key.toLowerCase() !== key && !ev.shiftKey;
    } else {
      if (key === 'CapsLock') {
        this.isCapsOn = !this.isCapsOn;
      }
    }
  }

  private logout() {
    this.$logout();
  }

  private toggleDark() {
    this.dark = !this.dark;
    save.set('dark', this.dark ? 'x' : '');
  }

  private breadMap(arr: string[]) {
    return arr.map((el) => ({ text: el, disabled: true }));
  }
  private created() {
    if (!this.$authToken()) {
      this.$router.push({
        path: '/login',
        query: { next: this.$route.fullPath }
      });
    } else {
      this.$apolloClient
        .query({
          query: gql`
            query($authToken: String!) {
              getMyUserData(authToken: $authToken) {
                userName
                person {
                  vorname
                  nachname
                }
                ablaufDatum {
                  german
                }
              }
            }
          `,
          variables: {
            authToken: this.$authToken()
          }
        })
        .then((res) => {
          this.data = res.data.getMyUserData;
        });
    }

    this.timer = setInterval(this.updateAlive, 30 * 1000);
    this.updateAlive();
  }

  private async updateAlive() {
    const num = await this.$logoutIn();

    const mins = Math.trunc(num / 1000 / 60);

    this.alive = mins;

    if (this.alive < 15) {
      this.loginDialog = true;
    }
  }

  private beforeDestroy() {
    if (!this.timer) { return; }
    clearInterval(this.timer);
  }
}
</script>