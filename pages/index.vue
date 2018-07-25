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
        grid-list-lg
        hidden-sm-and-down
      >
        <v-layout row wrap>
          <v-flex
            v-for="card in cards"
            v-bind="{ [`xs${card.flex}`]: true }"
            :key="card.title"
          >
            <v-card height="325px">
              <img :src="card.src" width="100%" />
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
      cards: [
        { title: 'Dashboard', text: 'See basic "Top 5" stats for your bills and quickly track what has been paid for the week', src: '/images/screens/Dashboard.png', flex: 4 },
        { title: 'Weekly Forecast', text: 'See what is due, what is paid and what is left this week', src: '/images/screens/Week.png', flex: 4 },
        { title: 'Monthly Forecast', text: 'Prefer seeing your whole month at a glance? See what is due, what is paid and what is left this month', src: '/images/screens/Month.png', flex: 4 },
        { title: 'Bills List', text: 'See all your bills in one easy screen along with APR and yearly totals. Also see which bills are paid automatically so you never forget a bill', src: '/images/screens/Payee.png', flex: 4 },
        { title: 'Create Bill', text: 'Enter in basic information to create a new bill and begin tracking it immediately', src: '/images/screens/NewBill.png', flex: 4 },
        { title: 'Detailed Bill/Payment Information', text: 'See your monthly amount, monthly average and yearly amount as well as your payment history', src: '/images/screens/Detail.png', flex: 4 },
        { title: 'Update Bill', text: 'Something change? It is easy to update the details of your bill', src: '/images/screens/EditBill.png', flex: 4 },
        { title: 'Payment History', text: 'See all payments you have made', src: '/images/screens/Payments.png', flex: 4 }
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
