<template>

  <v-flex fill-height v-if="init">
    <v-btn
      :to="'/' + forecast"
      color="primary">
      Forecast
    </v-btn>

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

            <v-btn
              @click="handleUpdate()"
              class="d-block mt-1"
              color="success"
              small>
              Edit
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
        <tr>
          <td>{{ props.item.ref | moment('ddd DD MMM YYYY') }}</td>
          <td>{{ props.item.createdAt | moment('ddd DD MMM YYYY') }}</td>
          <td>{{ props.item.amount | currencyFormat }}</td>
        </tr>
      </template>
    </v-data-table>

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

            </v-layout>

          </v-form>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="createFlag = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click.native="updateePayee()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-flex>

</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Moment from 'moment-timezone'
import axios from 'axios'

export default {
  middleware: 'authenticated',
  data () {
    return {
      id: this.$route.params.id,
      headers: [
        { text: 'Due', sortable: false, value: 'ref' },
        { text: 'Paid', sortable: false, value: 'createdAt' },
        { text: 'Amount', sortable: false, value: 'amount' }
      ],
      createFlag: false,
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
    },
    handleUpdate () {
      this.$refs.form.reset()
      this.editing.name = this.current.name
      this.editing.description = this.current.description
      this.editing.amount = parseFloat(this.current.amount).toFixed(2)
      this.editing.ref = this.current.ref
      this.editing.url = this.current.url
      this.editing.apr = this.current.apr
      this.createFlag = true
    },
    async updateePayee () {
      // save the payment currently queued
      if (this.$refs.form.validate()) {
        await axios.post(`https://api.billtrackr.com/user/${this.loggedUser.app_metadata.userid}/payees/`, {
          _id: this.$route.params.id,
          name: this.editing.name,
          description: this.editing.description,
          amount: this.editing.amount,
          ref: this.editing.ref,
          url: this.editing.url,
          apr: this.editing.apr,
          day: new Moment(this.editing.ref).format('D')
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
    ...mapState(['init', 'payees', 'payments', 'forecast']),
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