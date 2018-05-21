<template>
  <v-layout row fill-height>
    <v-flex xs12>
      <v-data-table
        :headers="headers"
        :items="payments"
        class="elevation-1">

        <template slot="items" slot-scope="props">
          <td>{{ props.item.ref | dayFormat }}</td>
          <td>{{ props.item.payee | getName(payees  ) }}</td>
          <td>{{ props.item.amount | currencyFormat }}</td>
          <td>
            <v-btn icon nuxt class="mx-0" :to="'/payees/'+ props.item.payee">
              <v-icon color="teal">edit</v-icon>
            </v-btn>
          </td>
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
        { text: 'Due', align: 'left', sortable: false, value: 'ref' },
        { text: 'Name', align: 'left', sortable: false, value: 'name' },
        { text: 'Amount', align: 'left', sortable: false, value: 'amount' },
        { text: 'Actions', align: 'left', sortable: false, value: 'actions', width: '75px' }
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
      console.log(payee)
      return payee[0].name
    }
  }
}
</script>
