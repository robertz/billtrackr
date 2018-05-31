<template>

  <v-layout row>
    <v-flex xs12>
      <v-btn
        fab
        dark
        color="red"
        @click.native="createFlag = true">
        <v-icon>add</v-icon>
      </v-btn>
      <v-data-table
        :headers="headers"
        :items="payees"
        hide-actions
        class="elevation-1">
        <template slot="items" slot-scope="props">
          <tr @click.stop="selectRow(props.item._id)">
            <td>{{ props.item.ref | moment('Do') }}</td>
            <td>{{ props.item.name }}</td>
            <td class="hidden-sm-and-down">{{ props.item.apr | pctFormat }}</td>
            <td>{{ props.item.amount | currencyFormat }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-flex>

    <v-dialog v-model="createFlag" max-width="400">
      <v-card>
        <v-card-title class="headline">Create Payee</v-card-title>
        <v-card-text>
          <v-layout row wrap>
            <v-flex xs12 class="px-2">
              <v-text-field
                v-model="editing.name"
                label="Name"
                type="text">
              </v-text-field>
            </v-flex>

            <v-flex xs12 class="px-2">
              <v-text-field
                v-model="editing.ref"
                label="Ref Date"
                type="date">
              </v-text-field>
            </v-flex>

            <v-flex xs12 sm5>
              <v-text-field
                v-model="editing.amount"
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                max="9999">
              </v-text-field>
            </v-flex>

            <v-flex xs12 offset-sm2 sm5>
              <v-text-field
                v-model="editing.apr"
                label="APR %"
                type="number"
                step="0.01"
                min="0"
                max="100">
              </v-text-field>
            </v-flex>

            <v-flex xs12>
              <v-text-field
                v-model="editing.url"
                label="URL"
                type="url">
              </v-text-field>
            </v-flex>

          </v-layout>


        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="createFlag = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click.native="createFlag = false">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-layout>
</template>

<script>
import { mapState } from 'vuex'
import Moment from 'moment-timezone'

export default {
  middleware: 'authenticated',
  data () {
    return {
      createFlag: false,
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
    moment (value, format) {
      return new Moment(value).format(format)
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
