<template>

  <v-layout v-if="init">
    <v-flex xs12>
      <!-- Top 5's -->
      <v-container v-bind="{ [`grid-list-md`]: true }" fluid>
        <v-layout row>

          <v-flex xs12 md4 v-if="displayWidgets.topAPR">
            <v-card class="elevation-2">
              <v-card-text>
                <h3>Top 5 by APR%</h3>
                <v-divider class="mb-2"></v-divider>
                <v-layout row v-for="item in topAPR" :key="item._id">
                  <v-flex xs9><nuxt-link :to="'/payees/' + item._id">{{ item.name }}</nuxt-link></v-flex>
                  <v-flex xs3>{{ item.apr | pct }}</v-flex>
                </v-layout>
              </v-card-text>
            </v-card>
          </v-flex>

          <v-flex xs12 md4 v-if="displayWidgets.topAmount">
            <v-card class="elevation-2">
              <v-card-text>
                <h3>Top 5 by Amount</h3>
                <v-divider class="mb-2"></v-divider>
                <v-layout row v-for="item in topAmount" :key="item._id">
                  <v-flex xs9><nuxt-link :to="'/payees/' + item._id">{{ item.name }}</nuxt-link></v-flex>
                  <v-flex xs3>{{ item.amount | currencyFormat }}</v-flex>
                </v-layout>
              </v-card-text>
            </v-card>
          </v-flex>

        </v-layout>
      </v-container>

      <v-container fluid v-if="displayWidgets.due">
        <div class="title">Payments Due</div>
      </v-container>
      <v-container v-bind="{ [`grid-list-md`]: true }" fluid>
        <v-layout row wrap>
          <v-flex
            v-for="payee in forecast.payees"
            :key="payee._id"
            xs12 md3
          >
            <v-card flat tile class="elevation-1">
              <v-card-text>
                <v-layout row>
                  <v-flex xs3>
                    <h2>{{ payee.date | moment('Do') }}</h2>
                  </v-flex>
                  <v-flex xs8>
                    <h3>{{ payee.name }}</h3>
                    {{ payee.amount | currencyFormat }}
                  </v-flex>
                  <v-flex xs1>
                    <v-icon v-if="payee.isPaid" class="green--text">done</v-icon>
                  </v-flex>
                </v-layout>

              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>

    </v-flex>
  </v-layout>

</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Moment from 'moment-timezone'
import _ from 'lodash'

export default {
  middleware: 'authenticated',
  created () {
    return {
      ref: new Moment().format('YYYY-MM-DD')
    }
  },
  computed: {
    displayWidgets () {
      return {
        topAPR: this.topAPR.length,
        topAmount: this.payees.length,
        due: this.forecast.payees.length,
        empty: !this.payees.length
      }
    },
    topAPR () {
      let hasAPR = this.payees.filter((payee) => { return payee.apr > 0 })
      let sorted = _.orderBy(hasAPR, ['apr'], ['desc'])
      return sorted.slice(0, 5)
    },
    topAmount () {
      let sorted = _.orderBy(this.payees, ['amount'], ['desc'])
      return sorted.slice(0, 5)
    },
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
        let diff = new Moment(this.payees[i].day < endOfWeek.format('D') ? startOfWeek : endOfWeek).diff(this.payees[i].ref, 'months')
        // console.log(`Payee: ${this.payees[i].name} -> ${this.payees[i].day} <  ${endOfWeek.format('D')} - ${this.payees[i].day < endOfWeek.format('D') ? 'using startOfWeek' : 'using endOfWeek'}`)
        let eventDate = new Moment(this.payees[i].ref).add(diff, 'months')

        if (eventDate.isBefore(startOfWeek)) {
          eventDate.add(1, 'month')
        }

        // Account for end of the month issues
        let dayValid = this.payees[i].day !== parseInt(eventDate.format('D')) ? this.payees[i].day > eventDate.daysInMonth() : true

        // ts and te is one day before and one day after so dates fall in between
        let ts = new Moment(startOfWeek).subtract(1, 'day')
        let te = new Moment(endOfWeek).add(1, 'day')
        if (eventDate.isBetween(ts, te) && dayValid) {
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
          // Dates do not always sort correctly. Fix the issue
          data.payees = _.sortBy(data.payees, (payee) => { return new Moment(payee.date) })
        }
      }
      return data
    },
    ...mapGetters(['loggedUser']),
    ...mapState(['init', 'payees', 'payments', 'userSettings'])
  },
  filters: {
    moment (value, format) {
      return new Moment(value).format(format)
    },
    pct (value) {
      return parseFloat(value).toFixed(2) + '%'
    },
    currencyFormat (value) {
      return '$' + parseFloat(value).toFixed(2)
    }
  }
}
</script>

<style scoped>
  a {
    text-decoration: none;
  }
</style>

