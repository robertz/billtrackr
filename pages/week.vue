<template>
  <v-container v-bind="{ 'grid-list-md': true }" fluid v-if="init">
    <v-layout row>
      <v-flex>
        <v-btn 
          color="primary"
          @click="setWeek(forecast.timing.prev)">Prev</v-btn>
      </v-flex>
      <v-flex class="text-xs-center pt-3 hidden-sm-and-down">
          <strong>{{ forecast.timing.startOfWeek.format("dddd, MMM, Do YYYY") }} - {{ forecast.timing.endOfWeek.format("dddd, MMM, Do YYYY") }}</strong>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn 
          color="primary"
          @click="setWeek(forecast.timing.next)">Next</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 sm3>
        <v-card class="elevation-1 text-xs-center" height="115px">
          <v-card-text>
            <span class="detail-header">Amount Due</span>
            <div class="detail-text">{{ forecast.stats.amountDue | currencyFormat }}</div>
            <span class="detail-header  ">{{ forecast.stats.percentMonth | pct }} of month</span>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 sm3>
        <v-card class="elevation-1 text-xs-center" height="115px">
          <v-card-text>
            <div class="detail-header">Amount Paid</div>
            <div class="detail-text">{{ forecast.stats.amountPaid | currencyFormat }}</div>
            <span class="detail-header  ">{{ forecast.stats.percentWeek | pct }} of week</span>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 sm3>
        <v-card class="elevation-1 text-xs-center" height="115px">
          <v-card-text>
            <span class="detail-header">Amount Remaining</span>
            <div class="detail-text">{{ forecast.stats.amountRemain | currencyFormat }}</div>
            <span class="detail-header  ">{{ forecast.stats.percentRemain | pct }} of Week</span>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 sm3>
        <v-card class="elevation-1 text-xs-center" height="115px">
          <v-card-text>
            <span class="detail-header">Credit Due</span>
            <div class="detail-text">{{ forecast.stats.amountCredit | currencyFormat }}</div>
            <span class="detail-header  ">{{ forecast.stats.percentCredit | pct }} of Week</span>
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
        <td><nuxt-link :to="'/payees/' + props.item.id" style="text-decoration: none;">{{ props.item.name }}</nuxt-link></td>
        <td>{{ props.item.date.format('ddd, DD MMM YYYY') }}</td>
        <td class="hidden-sm-and-down">{{ props.item.apr | pct }}</td>
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
import _ from 'lodash'
import axios from 'axios'

export default {
  middleware: 'authenticated',
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
  filters: {
    currencyFormat (value) {
      return '$' + parseFloat(value).toFixed(2)
    },
    pct (value) {
      if (!value) return
      return parseFloat(value).toFixed(3) + '%'
    },
    payeeName (value, payees) {
      if (!value) return
      let filtered = payees.filter((payee) => { return payee.id === value })
      return filtered.length ? filtered[0].name : ''
    }
  },
  methods: {
    setWeek (dt) {
      dt = dt || new Moment().format('YYYY-MM-DD')
      this.$store.commit('SET_REFDATE', dt)
      this.$router.push({ path: '/week?dt=' + dt })
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
      if (!this.init) return []
      Moment.tz.setDefault(this.userSettings.tz)
      let activePayees = this.payees.filter((payee) => {
        return payee.active === true
      })
      // adjust the start of the week to the user offset.. 0 = Sunday 6 = Saturday
      let startOfWeek = new Moment(this.refDate).startOf('week').subtract(7 - this.userSettings.offset, 'days')
      // Compensate for offset logic going too far back
      if (new Moment(this.refDate).diff(startOfWeek, 'days') >= 7) {
        startOfWeek.add(7, 'days')
      }
      let endOfWeek = new Moment(startOfWeek).add(6, 'days')
      let data = {
        timing: {
          startOfWeek: startOfWeek,
          endOfWeek: endOfWeek,
          prev: new Moment(startOfWeek).subtract(1, 'week').format('YYYY-MM-DD'),
          next: new Moment(startOfWeek).add(1, 'week').format('YYYY-MM-DD')
        },
        stats: {
          count: 0,
          amountDue: 0,
          amountPaid: 0,
          amountRemain: 0,
          amountCredit: 0,
          percentMonth: 0,
          percentWeek: 0,
          percentRemain: 0,
          percentCredit: 0,
          monthlyTotal: activePayees.reduce((acc, payee) => acc + payee.amount, 0)
        },
        graph: {
          dailyGraph: false,
          dailyCalculated: [0, 0, 0, 0, 0, 0, 0],
          dailyActual: [0, 0, 0, 0, 0, 0, 0],
          dailyOrder: []
        },
        payees: []
      }
      for (let d = 0; d < 7; d++) {
        data.graph.dailyOrder[d] = new Moment(startOfWeek).add(d, 'days').format('D')
      }
      for (let i = 0; i < this.payees.length; i++) {
        // How many months to add to bring the reference date to the current month
        let diff = new Moment(this.refDate).diff(this.payees[i].ref, 'months')
        let eventDate = new Moment(this.payees[i].ref).add(diff, 'months')
        if (eventDate.isBefore(startOfWeek)) {
          eventDate.add(1, 'month')
        }
        // ts and te is one day before and one day after so dates fall in between
        let ts = new Moment(startOfWeek).subtract(1, 'day')
        let te = new Moment(endOfWeek).add(1, 'day')
        if (eventDate.isBetween(ts, te)) {
          // Is the current payee/payment ref found in the payment list
          let isPaid = this.payments.filter((payment) => {
            return (payment.payee === this.payees[i]._id && payment.ref === eventDate.format('YYYY-MM-DD'))
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
              isPaid: false
            }
            // Calculate the daily caclulated values
            data.graph.dailyCalculated[ data.graph.dailyOrder.indexOf(eventDate.format('D')) ] += this.payees[i].amount.toFixed(2) * 1
            // If the bill is paid, mark the payee and add the amount
            if (isPaid.length) {
              payeeData.isPaid = true
              let payeeAmount = isPaid.reduce((acc, payment) => acc + payment.amount, 0)
              data.stats.amountPaid += payeeAmount
              // Calculate the daily actual values
              data.graph.dailyActual[ data.graph.dailyOrder.indexOf(eventDate.format('D')) ] += payeeAmount * 1
              // If the payee is inactive and it's been paid add it to the monthly total
              data.stats.monthlyTotal += payeeAmount
              if (this.payees[i].apr) {
                data.stats.amountCredit += payeeAmount
              }
            }
            if (this.payees[i].apr && !isPaid.length) {
              data.stats.amountCredit += this.payees[i].amount
            }
            // Push the current payee info into the payee array
            data.payees.push(payeeData)
            data.stats.amountDue += this.payees[i].amount
          }
          // Handle summing things up for the current week
          data.stats.count = data.payees.length
          data.stats.percentMonth = data.stats.amountDue / data.stats.monthlyTotal * 100
          if (data.stats.amountDue) {
            data.stats.percentWeek = data.stats.amountPaid / data.stats.amountDue * 100
          }
          data.stats.amountRemain = data.stats.amountDue - data.stats.amountPaid
          data.stats.percentRemain = data.stats.amountRemain / data.stats.amountDue * 100
          data.stats.percentCredit = data.stats.amountCredit / data.stats.amountDue * 100
          // If amount remaining goes negative (paid over the monthly calculation)
          if (data.stats.amountRemain < 0) {
            data.stats.amountRemain = 0
            data.stats.percentRemain = 0
          }
          // Dates do not always sort correctly. Fix fix the issue
          data.payees = _.sortBy(data.payees, (payee) => { return new Moment(payee.date) })
        }
      }
      return data
    },
    ...mapState(['payees', 'payments', 'userSettings', 'refDate', 'init']),
    ...mapGetters(['loggedUser'])
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
