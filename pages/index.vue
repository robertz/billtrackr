<template>
  <v-container fluid>
    <v-flex xs12>
      <v-jumbotron
        src="/images/christine-roy-343235-unsplash.jpg"
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
    </v-flex>

    <v-card>
      <v-container
        fluid
        grid-list-md
      >
        <v-layout row wrap>
          <v-flex
            v-for="card in cards"
            v-bind="{ [`xs${card.flex}`]: true }"
            :key="card.title"
          >
            <v-card>
              <v-card-media
                :src="card.src"
                height="300px"
              ></v-card-media>
              <v-card-title>
                <div>
                  <h3 headline mb-1>{{ card.title }}</h3>
                  <div>{{ card.text }}</div>
                </div>
              </v-card-title>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>

  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  layout: 'anon',
  mounted () {
    if (this.isAuthenticated) this.$router.push({ path: '/dashboard' })
  },
  data () {
    return {
      flexSize: this.$vuetify.breakpoint.mdAndDown ? 12 : 6,
      cards: [
        { title: 'Dashboard', text: 'View your week at a glance along with some basic stats', src: '/images/screens/Dashboard.png', flex: this.flexSize },
        { title: 'Weekly Forecast', text: 'See the details you need to stay on top of your bills for the week', src: '/images/screens/Week.png', flex: this.flexSize },
        { title: 'Monthly Forecast', text: 'Prefer seeing your whole month at a glance? Track all your bills', src: '/images/screens/Month.png', flex: this.flexSize },
        { title: 'Payee Listing', text: 'See everyone you pay in one easy screen along with APR and yearly totals', src: '/images/screens/Payee.png', flex: this.flexSize },
        { title: 'Detailed Payee/Payment Information', text: 'See your monthly average and yearly amounts', src: '/images/screens/Detail.png', flex: this.flexSize },
        { title: 'Payment History', text: 'Quickly see all your payments', src: '/images/screens/Payments.png', flex: this.flexSize }
      ]
    }
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
