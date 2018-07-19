<template>

  <v-container v-bind="{ 'grid-list-md': true }" v-if="init">
    <v-layout row>
      <v-flex>
        <v-btn
          color="primary"
          @click="setDate(forecast.prevMonth)">Prev</v-btn>
      </v-flex>
      <v-flex class="text-xs-center pt-3 hidden-sm-and-down">
          <strong>{{ forecast.timing.startOfMonth.format("MMMM YYYY") }}</strong>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn
          color="primary"
          @click="setDate(forecast.nextMonth)">Next</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 sm3>
        <v-card class="elevation-1 text-xs-center" height="115px">
          <v-card-text>
            <span class="detail-header">Amount Due</span>
            <div class="detail-text">{{ forecast.stats.monthlyTotal | currencyFormat }}</div>
            <span class="detail-header">Total</span>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 sm3>
        <v-card class="elevation-1 text-xs-center" height="115px">
          <v-card-text>
            <div class="detail-header">Amount Paid</div>
            <div class="detail-text">{{ forecast.stats.amountPaid | currencyFormat }}</div>
            <span class="detail-header  ">{{ forecast.stats.pctPaid | pct }} of month</span>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 sm3>
        <v-card class="elevation-1 text-xs-center" height="115px">
          <v-card-text>
            <span class="detail-header">Amount Remaining</span>
            <div class="detail-text">{{ forecast.stats.amountRemaining | currencyFormat }}</div>
            <span class="detail-header  ">{{ forecast.stats.pctRemain | pct }} of month</span>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 sm3>
        <v-card class="elevation-1 text-xs-center" height="115px">
          <v-card-text>
            <span class="detail-header">Credit Due</span>
            <div class="detail-text">{{ forecast.stats.amountCredit | currencyFormat }}</div>
            <span class="detail-header  ">{{ forecast.stats.pctCredit | pct }} of month</span>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-data-table
      :headers="headers"
      :items="forecast.payees"
      hide-actions
      class="elevation-1 mt-4">
      <template slot="items" slot-scope="props">
        <td>
          <nuxt-link :to="'/payees/' + props.item.id" style="text-decoration: none;">{{ props.item.name }}</nuxt-link>
          &nbsp;&nbsp;
          <v-icon small v-if="props.item.autopay" color="green">cached</v-icon>
        </td>
        <td>{{ props.item.date.format('ddd, DD MMM YYYY') }}</td>
        <td class="hidden-sm-and-down">{{ props.item.apr | pct(true) }}</td>
        <td width="20%">
          <v-btn :color="props.item.isPaid ? 'success': 'warning'" block @click="handlePayment(props.item.id, props.item.isPaid)">
            <span v-if="props.item.isPaid">Paid</span>
            <span v-else>{{ props.item.amount | currencyFormat }}</span>
          </v-btn>
        </td>
      </template>
    </v-data-table>

    <v-dialog v-model="addPayment" max-width="400">
      <v-card>
        <v-card-title class="headline">{{ payment.id | payeeName(forecast.payees) }}</v-card-title>
        <v-card-text>

          <v-text-field
            placeholder="Ref Date"
            label="Ref Date"
            v-model="payment.ref"
            ></v-text-field>

          <v-text-field
            placeholder="Amount"
            label="Amount"
            v-model="payment.amount"
            ></v-text-field>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="addPayment = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click.native="savePayment()">Pay</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>

</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Moment from 'moment-timezone'
import axios from 'axios'

export default {
  middleware: 'authenticated',
  created () {
    // Store dt value if it was passed in
    if (('dt' in this.$route.query) && new Moment(this.$route.query.dt).isValid()) {
      this.$store.commit('SET_REFDATE', this.$route.query.dt)
    }
    this.$store.commit('SET_FORECAST', 'month')
  },
  data () {
    return {
      addPayment: false,
      headers: [
        { text: 'Name', sortable: false, value: 'name' },
        { text: 'Due', sortable: false, value: 'date' },
        { text: 'APR %', sortable: false, value: 'apr', class: 'hidden-sm-and-down' },
        { text: '', sortable: false, value: '' }
      ],
      payment: {
        id: null,
        name: null,
        ref: null,
        amount: null
      }
    }
  },
  methods: {
    setDate (dt) {
      dt = dt || new Moment().format('YYYY-MM-DD')
      this.$store.commit('SET_REFDATE', dt)
      this.$router.push({ path: '/month?dt=' + dt })
    },
    handlePayment (id, isPaid) {
      if (isPaid) {
        this.$router.push({ path: `payees/${id}` })
      }
      let payeeData = this.forecast.payees.filter((payee) => { return payee.id === id })[0]
      this.payment.id = id
      this.payment.ref = payeeData.date.format('YYYY-MM-DD')
      this.payment.amount = parseFloat(payeeData.amount).toFixed(2)
      this.addPayment = true
    },
    async savePayment () {
      // save the payment currently queued
      await axios.post(`https://api.billtrackr.com/user/${this.loggedUser.app_metadata.userid}/payments`, {
        payee: this.payment.id,
        ref: this.payment.ref,
        amount: this.payment.amount
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      await this.$store.dispatch('refreshPayments')
      this.addPayment = false
    }
  },
  computed: {
    forecast () {
      if (!this.payees) return []
      Moment.tz.setDefault(this.userSettings.tz)
      let activePayees = this.payees.filter((payee) => {
        return payee.active === true
      })

      // Stub out the payload for the page
      let data = {
        timing: {
          startOfWeek: null,
          endOfWeek: null,
          startOfMonth: null,
          endOfMonth: null
        },
        stats: {
          monthlyTotal: activePayees.reduce((acc, payee) => acc + payee.amount, 0),
          amountPaid: 0,
          amountRemaining: 0,
          amountCredit: 0,
          pctPaid: 0,
          pctRemain: 0,
          pctCredit: 0
        },
        graph: {
          labels: [],
          actual: [],
          calculated: []
        },
        payees: [],
        nextMonth: null,
        prevMonth: null,
        hasPayees: this.payees.length
      }

      // Calculate the range for the current week
      // adjust the start of the week to the user offset.. 0 = Sunday 6 = Saturday
      data.timing.startOfWeek = new Moment().startOf('week').subtract(7 - this.userSettings.offset, 'days')
      // Compensate for offset logic going too far back
      if (new Moment().diff(data.timing.startOfWeek, 'days') >= 7) {
        data.timing.startOfWeek.add(7, 'days')
      }
      data.timing.endOfWeek = new Moment(data.timing.startOfWeek).add(6, 'days')
      // ts and te is one day before and one day after so dates fall in between
      let ts = new Moment(data.timing.startOfWeek).subtract(1, 'day')
      let te = new Moment(data.timing.endOfWeek).add(1, 'day')
      // End of week calcs

      data.timing.startOfMonth = new Moment(this.refDate).startOf('month')
      data.timing.endOfMonth = new Moment(data.timing.startOfMonth).endOf('month')

      data.prevMonth = new Moment(data.timing.startOfMonth).subtract(1, 'month').format('YYYY-MM-DD')
      data.nextMonth = new Moment(data.timing.startOfMonth).add(1, 'month').format('YYYY-MM-DD')

      // Build graph data
      let monthlyPayments = this.payments.filter((payment) => {
        return payment.ref.indexOf(new Moment(this.refDate).format('YYYY-MM'))
      })

      let creditAccounts = activePayees.filter(payee => {
        return payee.apr
      })

      data.stats.amountCredit = creditAccounts.reduce((acc, payee) => acc + payee.amount, 0)

      // Default graph values for the month
      for (let i = 0; i < data.timing.startOfMonth.daysInMonth(); i++) {
        data.graph.labels[i] = i + 1
        data.graph.actual[i] = 0
        data.graph.calculated[i] = 0
      }
      // Build actual daily expenditure amounts for graph
      for (let payment of monthlyPayments) {
        let ndx = new Moment(payment.ref).format('D') - 1
        data.graph.actual[ndx] += payment.amount
      }

      for (let i = 0; i < this.payees.length; i++) {
        // How many months to add to bring the reference date to the current month
        let diff = new Moment(this.refDate).diff(this.payees[i].ref, 'months')

        let eventDate = new Moment(this.payees[i].ref).add(diff, 'months')
        if (eventDate.isBefore(data.timing.startOfMonth)) {
          eventDate.add(1, 'month')
        }

        let dateCheck = this.payees[i].day !== parseInt(eventDate.format('D')) ? this.payees[i].day > eventDate.daysInMonth() : true
        if (!dateCheck) {
          let computed = eventDate.format('D')
          let adj = this.payees[i].day - computed
          eventDate = new Moment(eventDate).add(adj, 'days')
        }

        // Is the current payee/payment ref found in the payment list
        let isPaid = this.payments.filter((payment) => {
          return payment.payee === this.payees[i]._id && payment.ref === eventDate.format('YYYY-MM-DD')
        })

        // Hide occurences of payees before its ref date AND the payee is ACTIVE OR
        // there is a payment for the current period. Payee data may be required for
        // historical reasons

        if ((eventDate.isAfter(new Moment(this.payees[i].ref)) || eventDate.isSame(new Moment(this.payees[i].ref))) && (this.payees[i].active || isPaid.length)) {
          // Stub out the payment information for the page
          let payeeData = {
            id: this.payees[i]._id,
            date: eventDate,
            name: this.payees[i].name,
            url: this.payees[i].url,
            description: this.payees[i].description,
            amount: this.payees[i].amount,
            apr: this.payees[i].apr,
            autopay: this.payees[i].autopay,
            currentWeek: eventDate.isBetween(ts, te),
            isToday: eventDate.startOf('day').isSame(new Moment().startOf('day')),
            isPaid: false
          }

          // If the bill is paid, mark the payee and add the amount
          if (isPaid.length) {
            payeeData.isPaid = true

            let payeeTotal = isPaid.reduce((acc, payment) => acc + payment.amount, 0)

            data.stats.amountPaid += payeeTotal
            // If the payee is inactive and it's been paid add it to the monthly total
            if (this.payees[i].active === false) {
              data.stats.monthlyTotal += payeeTotal

              if (this.payees[i].apr) {
                data.stats.amountCredit += payeeTotal
              }
            }
          }
          // Build calculated daily expenditure amounts graph data
          data.graph.calculated[eventDate.format('D') - 1] += this.payees[i].amount
          // Push the current payee info into the payee array
          data.payees.push(payeeData)
        }
      }

      data.stats.amountRemaining = data.stats.monthlyTotal ? data.stats.monthlyTotal - data.stats.amountPaid : 0
      // Avoid divide by 0 issues
      data.stats.pctPaid = data.stats.monthlyTotal ? (data.stats.amountPaid / data.stats.monthlyTotal) * 100 : 0
      data.stats.pctRemain = data.stats.monthlyTotal ? (data.stats.amountRemaining / data.stats.monthlyTotal) * 100 : 0

      data.stats.pctCredit = data.stats.amountCredit / data.stats.monthlyTotal * 100

      // If amount remaining goes negative (paid over the monthly calculation)
      if (data.stats.amountRemaining < 0) {
        data.stats.amountRemaining = 0
        data.stats.pctRemain = 0
      }

      return data
    },
    ...mapState(['init', 'payees', 'payments', 'userSettings', 'refDate']),
    ...mapGetters(['loggedUser'])
  },
  filters: {
    currencyFormat (value) {
      return '$' + parseFloat(value).toFixed(2)
    },
    pct (value, hideZero = false) {
      if (!value && hideZero) return
      return parseFloat(value).toFixed(3) + '%'
    },
    payeeName (value, payees) {
      if (!value) return
      let filtered = payees.filter((payee) => { return payee.id === value })
      return filtered.length ? filtered[0].name : ''
    }
  }
}
</script>

<style scoped>
  .detail-header {
    text-transform: uppercase;
    font-size: 80%;
  }

  .detail-text {
    font-size: 150%;
    font-weight: bold;
  }
</style>