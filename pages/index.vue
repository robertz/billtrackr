<template>
  <v-jumbotron 
    src="/images/victoria-heath-597279-unsplash.jpg"
    dark>
    <v-container 
      fill-height>
      <v-layout align-center>
        <v-flex>
          <h3 class="display-3">BillTrackr</h3>
          <span class="subheading">Easily track who you pay each month</span>
          <v-divider class="my-3"></v-divider>
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
  created () {
    if (this.isAuthenticated) this.$router.push({ path: '/dashboard' })
  },
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

<style>
  .with-backdrop {
    background: url();
  }
</style>
