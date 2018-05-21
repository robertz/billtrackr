<template>
  <v-jumbotron color="grey lighten-2">
    <v-container fill-height>
      <v-layout align-center>
        <v-flex>
          <h3 class="display-3">Welcome to the site</h3>
          <span class="subheading">Lorem ipsum dolor sit amet, pri veniam forensibus id. Vis maluisset molestiae id, ad semper lobortis cum. At impetus detraxit incorrupte usu, repudiare assueverit ex eum, ne nam essent vocent admodum.</span>
          <v-divider class="my-3"></v-divider>
          <div class="title mb-3">Check out our newest features!</div>
          <v-btn large color="primary" class="mx-0" @click="login()">Sign In</v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-jumbotron>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  layout: 'anon',
  data () {
    return {}
  },
  methods: {
    login () {
      if (this.isAuthenticated) {
        this.$router.push({ path: '/dashboard' })
      } else {
        this.$router.push({ path: '/auth/sign-in' })
      }
    }
  },
  computed: {
    ...mapGetters(['loggedUser', 'isAuthenticated'])
  }
}
</script>
