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
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed app dark :clipped-left="clipped" color="primary">
      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-avatar size="46px" class="mr-2">
        <img
          :src="loggedUser.picture"
          :alt="loggedUser.name"
        >
      </v-avatar>
      <strong v-html="loggedUser.name"></strong>

    </v-toolbar>
    <v-content>
      <v-container fluid fill-height="">
        <nuxt />
      </v-container>
    </v-content>

  </v-app>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    async created () {
      if (this.isAuthenticated && !this.$store.state.payees.length) {
        await this.$store.dispatch('refreshUserSettings')
        await this.$store.dispatch('refreshPayees')
        await this.$store.dispatch('refreshPayments')
      }
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
          { icon: 'today', title: 'Week', to: '/' },
          { icon: 'timeline', title: 'Month', to: '/' },
          { icon: 'settings', title: 'Settings', to: '/' },
          { icon: 'exit_to_app', title: 'Sign Off', to: '/auth/sign-off' }
        ],
        miniVariant: false,
        title: 'BillTrackr'
      }
    },
    computed: {
      ...mapGetters(['loggedUser', 'isAuthenticated'])
    }
  }
</script>
