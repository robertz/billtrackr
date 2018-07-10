<template>
  <v-jumbotron
    src="/images/aidan-bartos-313782-unsplash.jpg"
    dark>
    <v-container
      fill-height>
      <v-layout align-center>
        <v-flex>
          <h3 class="display-3">BillTrackr</h3>
          <div class="subheading">Easily track who you pay each month</div>
          <v-btn large color="primary" class="mx-0 my-3" @click="login()">Sign In</v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-jumbotron>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  layout: 'anon',
  mounted () {
    if (this.isAuthenticated) this.$router.push({ path: '/dashboard' })
  },
  data () {
    return {}
  },
  methods: {
    login () {
      this.$router.push({ path: '/auth/sign-in' })
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
