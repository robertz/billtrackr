<template>

  <v-flex fill-height>
    <v-card>
      <v-card-title primary-title>
        <div class="headline">{{ current.name }}</div>
      </v-card-title>
      <v-card-text>
          <v-layout row wrap>
            <v-flex xs6>
              One
            </v-flex>
            <v-flex xs6>
              Two
            </v-flex>
          </v-layout>
        </v-card-text>
    </v-card>

    <v-data-table
      :headers="headers"
      :items="computedPayments"
      class="elevation-1">
      <template slot="items" slot-scope="props">
        <td>{{ props.item.ref | moment('ddd DD MM YYYY') }}</td>
        <td>{{ props.item.createdAt | moment('ddd DD MMM YYYY') }}</td>
        <td>{{ props.item.amount }}</td>
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
  computed: {
    computedPayments () {
      return this.payments.filter((payment) => { return payment.payee === this.id })
    },
    current () {
      return this.payees.filter(payee => payee._id === this.$route.params.id)[0] || {}
    },
    ...mapState(['payees', 'payments']),
    ...mapGetters(['loggedUser'])
  },
  filters: {
    moment (value, format) {
      return new Moment(value).format(format)
    }
  }
}
</script>
