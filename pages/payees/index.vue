<template>

  <v-layout row>
    <v-flex xs12>
      <v-btn
        fab
        dark
        color="red">
        <v-icon>add</v-icon>
      </v-btn>
      <v-data-table
        :headers="headers"
        :items="payees"
        hide-actions
        class="elevation-1">
        <template slot="items" slot-scope="props">
          <tr @click.stop="selectRow(props.item._id)">
            <td>{{ props.item.ref | dayFormat }}</td>
            <td>{{ props.item.name }}</td>
            <td class="hidden-sm-and-down">{{ props.item.apr | pctFormat }}</td>
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
        { text: 'Due', align: 'left', sortable: false, value: 'ref', width: '75px' },
        { text: 'Name', align: 'left', sortable: false, value: 'name' },
        { text: 'APR %', align: 'left', sortable: false, value: 'apr', class: 'hidden-sm-and-down' },
        { text: 'Amount', align: 'left', sortable: false, value: 'amount' }
      ],
      editing: {
        active: true,
        amount: 0,
        apr: 0,
        autopay: false,
        day: 1,
        name: '',
        ref: '',
        url: ''
      }
    }
  },
  methods: {
    selectRow (id) {
      this.$router.push({ path: `/payees/${id}` })
    }
  },
  computed: {
    ...mapState(['payees'])
  },
  filters: {
    dayFormat (value) {
      return new Moment(value).format('Do')
    },
    currencyFormat (value) {
      return '$' + parseFloat(value).toFixed(2)
    },
    pctFormat (value) {
      if (!value) return
      return parseFloat(value).toFixed(3)
    }
  }
}
</script>
