<template>
  <v-app>
    <v-navigation-drawer
      :mini-variant.sync="miniVariant"
      :clipped="$vuetify.breakpoint.lgAndUp"
      v-model="drawer"
      fixed
      app
    >
      <v-list>
        <v-list-tile
          router
          :to="item.to"
          :key="i"
          v-for="(item, i) in items"
          exact
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider></v-divider>
        <v-container>
          <a class="grey--text text--darken-2" @click="showSettings = !showSettings">Settings</a>
        </v-container>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed app dark :clipped-left="clipped" color="primary">
      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-avatar size="36px" class="mr-2">
        <img
          :src="loggedUser.picture"
          :alt="loggedUser.name"
        >
      </v-avatar>
      <strong v-html="loggedUser.name"></strong>

    </v-toolbar>
    <v-content>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-content>

    <v-dialog v-model="showSettings" max-width="400">
      <v-card>
        <v-card-title class="headline">Settings</v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-select
                  :items = offsets
                  label="Start of Week"
                  v-model="offsetProxy">
                </v-select>
                <v-select
                  autocomplete
                  :items = zoneNames
                  label="Timezone"
                  v-model="tzProxy">
                </v-select>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="showSettings = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click.native="updateSettings()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import Moment from 'moment-timezone'
  import axios from 'axios'

  export default {
    middleware: 'authenticated',
    async created () {
      if (this.isAuthenticated && !this.$store.state.payees.length) {
        await this.$store.dispatch('refreshUserSettings')
        await this.$store.dispatch('refreshPayees')
        await this.$store.dispatch('refreshPayments')
        await this.$store.dispatch('setInitialized')
      }
      this.offsetProxy = this.userSettings.offset
      this.tzProxy = this.userSettings.tz
    },
    data () {
      return {
        clipped: true, // drawer is under title bar
        drawer: true,
        fixed: false,
        items: [
          { icon: 'home', title: 'Dashboard', to: '/dashboard' },
          { icon: 'people', title: 'Payees', to: '/payees' },
          { icon: 'attach_money', title: 'Payments', to: '/payments' },
          { icon: 'today', title: 'Week', to: '/week' },
          { icon: 'timeline', title: 'Month', to: '/month' },
          { icon: 'exit_to_app', title: 'Sign Off', to: '/auth/sign-off' }
        ],
        miniVariant: false,
        title: 'BillTrackr',
        showSettings: false,
        zoneNames: Moment.tz.names(),
        offsets: [
          { text: 'Sunday', value: 0 },
          { text: 'Monday', value: 1 },
          { text: 'Tuesday', value: 2 },
          { text: 'Wednesday', value: 3 },
          { text: 'Thursday', value: 4 },
          { text: 'Friday', value: 5 },
          { text: 'Saturday', value: 6 }
        ],
        tzProxy: null,
        offsetProxy: null
      }
    },
    computed: {
      ...mapState(['userSettings']),
      ...mapGetters(['loggedUser', 'isAuthenticated'])
    },
    methods: {
      async refreshSettings () {
        await this.$store.dispatch('refreshUserSettings')
      },
      updateSettings () {
        return axios.put(`https://api.billtrackr.com/user/${this.loggedUser.app_metadata.userid}/settings`, {
          'offset': this.offsetProxy,
          'tz': this.tzProxy
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(() => {
            this.refreshSettings()
            this.showSettings = false
          })
      }
    }
  }
</script>
