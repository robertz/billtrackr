<template>

  <v-flex fill-height v-if="init">
    <v-card>
      <v-card-title primary-title>
        <div class="headline">{{ current.name }}</div>
      </v-card-title>
      <v-card-text>

        <div class="subheading">{{ current.description }}</div>
        <v-layout row wrap>
          <v-flex xs12>
            Payment of <strong>{{ current.amount | currencyFormat }}</strong> due on the <strong>{{ current.ref | moment('Do') }}</strong>
          </v-flex>
          <v-flex xs12 v-if="computedAverage != current.amount">
            Average payment is <strong>{{ computedAverage | currencyFormat }}</strong>
          </v-flex>

          <v-flex xs12>
            <v-btn
              color="primary"
              v-if="current.url"
              :href="current.url"
              target="_blank"
              small>
              <v-icon>credit_card</v-icon>
              <span class="ml-2">Pay Online</span>
            </v-btn>
          </v-flex>

        </v-layout>

      </v-card-text>
    </v-card>

    <v-data-table
      :headers="headers"
      :items="computedPayments"
      class="elevation-1 mt-3">
      <template slot="items" slot-scope="props">
        <tr @click.stop="setForecast(props.item.ref)">
          <td>{{ props.item.ref | moment('ddd DD MMM YYYY') }}</td>
          <td>{{ props.item.createdAt | moment('ddd DD MMM YYYY') }}</td>
          <td>{{ props.item.amount | currencyFormat }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-flex>

</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Moment from 'moment-timezone'

export default {
  middleware: 'authenticated',
  data () {
    return {
      id: this.$route.params.id,
      headers: [
        { text: 'Due', sortable: false, value: 'ref' },
        { text: 'Paid', sortable: false, value: 'createdAt' },
        { text: 'Amount', sortable: false, value: 'amount' }
      ]
    }
  },
  methods: {
    setForecast (dt) {
      this.$router.push({ path: '/week?dt=' + dt })
    }
  },
  computed: {
    computedAverage () {
      if (!this.computedPayments.length) {
        return this.current.amount
      } else {
        return this.computedPayments.reduce((acc, payment) => acc + payment.amount, 0) / this.computedPayments.length
      }
    },
    computedPayments () {
      return this.payments.filter((payment) => { return payment.payee === this.id })
    },
    current () {
      return this.payees.filter(payee => payee._id === this.$route.params.id)[0] || {}
    },
    ...mapState(['payees', 'payments', 'init']),
    ...mapGetters(['loggedUser'])
  },
  filters: {
    moment (value, format) {
      return new Moment(value).format(format)
    },
    currencyFormat (value) {
      return '$' + parseFloat(value).toFixed(2)
    }
  }
}
</script>

<style scoped>
  tr:hover {
    cursor: pointer;
  }
</style>