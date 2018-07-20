<template>

  <v-layout row>
    <v-flex xs12>
      <v-btn
        fab
        dark
        color="red"
        @click.native="handleAddNew()">
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
            <td>
              {{ props.item.name }}
              &nbsp;
              <v-icon small v-if="props.item.autopay">cached</v-icon>
            </td>
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
          <v-form ref="form" v-model="editing.valid" lazy-validation>

            <v-layout row wrap>
              <v-flex xs12 class="px-2">
                <v-text-field
                  v-model="editing.name"
                  :rules="[v => !!v || 'This field is required']"
                  label="Name"
                  type="text"
                  required>
                </v-text-field>
              </v-flex>

              <v-flex xs12 class="px-2">
                <v-text-field
                  v-model="editing.description"
                  label="Description"
                  type="text">
                </v-text-field>
              </v-flex>

              <v-flex xs12 class="px-2">
                <v-text-field
                  v-model="editing.ref"
                  :rules="[v => !!v || 'This field is required']"
                  label="Ref Date"
                  type="date"
                  required>
                </v-text-field>
              </v-flex>

              <v-flex xs12 sm5>
                <v-text-field
                  v-model="editing.amount"
                  :rules="[v => !!v || 'This field is required']"
                  label="Amount"
                  type="number"
                  step="0.01"
                  prefix="$"
                  required>
                </v-text-field>
              </v-flex>

              <v-flex xs12 offset-sm2 sm5>
                <v-text-field
                  v-model="editing.apr"
                  :rules="[aprCheck]"
                  :error-messages="errors.apr"
                  label="APR %"
                  type="number"
                  step="0.01">
                </v-text-field>
              </v-flex>

              <v-flex xs12>
                <v-text-field
                  v-model="editing.url"
                  :rules="[urlCheck]"
                  :error-messages="errors.url"
                  label="URL"
                  type="url">
                </v-text-field>
              </v-flex>

              <v-flex xs12>
                <v-switch
                  v-model="editing.autopay"
                  label="Autopay">
                </v-switch>
              </v-flex>

            </v-layout>

          </v-form>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="createFlag = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click.native="createPayee()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-layout>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Moment from 'moment-timezone'
import axios from 'axios'

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
      errors: {
        apr: [],
        url: []
      },
      editing: {
        active: true,
        amount: 0,
        apr: 0,
        autopay: false,
        day: 0,
        description: '',
        name: '',
        ref: '',
        url: '',
        valid: false
      }
    }
  },
  methods: {
    aprCheck () {
      this.errors.apr = []
      if (!this.editing.apr) return true

      let current = parseFloat(this.editing.apr)

      this.errors.apr = current < 0 || current > 100 ? 'APR can be between 0 and 100' : []

      return true
    },
    urlCheck () {
      this.errors.url = []
      if (!this.editing.url) return true
      this.errors.url = !/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!\\\\\w]*))?)/.test(this.editing.url) ? ['URL is invalid'] : []
      return true
    },
    handleAddNew () {
      this.$refs.form.reset()
      this.createFlag = true
    },
    selectRow (id) {
      this.$router.push({ path: `/payees/${id}` })
    },
    async createPayee () {
      // save the payment currently queued
      if (this.$refs.form.validate()) {
        await axios.post(`https://api.billtrackr.com/user/${this.loggedUser.app_metadata.userid}/payees`, {
          name: this.editing.name,
          description: this.editing.description,
          amount: this.editing.amount,
          ref: this.editing.ref,
          url: this.editing.url,
          apr: this.editing.apr,
          day: new Moment(this.editing.ref).format('D'),
          autopay: this.editing.autopay
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        await this.$store.dispatch('refreshPayees')
        this.createFlag = false
      }
    }
  },
  computed: {
    ...mapState(['payees']),
    ...mapGetters(['loggedUser'])
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

<style scoped>
  tr:hover {
    cursor: pointer;
  }
</style>