<template>
  <v-layout row fill-height>
    <v-flex xs12>
      <v-data-table
        :headers="headers"
        :items="payments"
        class="elevation-1">

        <template slot="items" slot-scope="props">
          <tr @click.stop="setPayee(props.item.payee)">
            <td>{{ props.item.payee | getName(payees) }}</td>
            <td>{{ props.item.ref | dayFormat }}</td>
            <td>{{ props.item.amount | currencyFormat }}</td>
          </tr>
        </template>

      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState } from 'vuex'
import Moment from 'moment-timezone'

export default {
  middleware: 'authenticated',
  data () {
    return {
      headers: [
        { text: 'Name', align: 'left', sortable: false, value: 'name' },
        { text: 'Due', align: 'left', sortable: false, value: 'ref' },
        { text: 'Amount', align: 'left', sortable: false, value: 'amount' }
      ]
    }
  },
  methods: {
    setPayee (id) {
      this.$router.push({ path: `/payees/${id}` })
    }
  },
  computed: {
    ...mapState(['payees', 'payments'])
  },
  filters: {
    dayFormat (value) {
      return new Moment(value).format('D MMM YYYY')
    },
    currencyFormat (value) {
      return '$' + parseFloat(value).toFixed(2)
    },
    getName (value, payees) {
      let payee = payees.filter((payee) => {
        return payee._id === value
      })
      return payee[0].name
    }
  }
}
</script>
