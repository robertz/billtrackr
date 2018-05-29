import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const store = () => new Vuex.Store({
  state: {
    sidebar: false,
    init: false,
    refDate: '2018-05-24',
    user: null,
    userSettings: null,
    payees: [],
    payments: []
  },
  getters: {
    isAuthenticated (state) {
      return !!state.user
    },
    loggedUser (state) {
      return state.user
    },
    userSettings (state) {
      return state.userSettings
    },
    payees (state) {
      return state.payees
    },
    payments (state) {
      return state.payments
    }
  },
  mutations: {
    SET_USER (state, user) {
      state.user = user || null
    },
    SET_PAYEES (state, payees) {
      state.payees = payees
    },
    SET_PAYMENTS (state, payments) {
      state.payments = payments
    },
    SET_USERSETTINGS (state, userSettings) {
      state.userSettings = userSettings || null
    },
    SET_REFDATE (state, refDate) {
      state.refDate = refDate || null
    },
    SET_INIT (state, init) {
      state.init = init
    },
    toggleSidebar (state) {
      state.sidebar = !state.sidebar
    }
  },
  actions: {
    setPayees ({ commit }, payees) {
      commit('SET_PAYEES', payees)
    },
    setPayments ({ commit }, payments) {
      commit('SET_PAYMENTS', payments)
    },
    setUserSettings ({ commit }, userSettings) {
      commit('SET_USERSETTINGS', userSettings)
    },
    setRefDate ({ commit }, refDate) {
      commit('SET_REFDATE', refDate)
    },
    async refreshUserSettings (ctx) {
      let res = await axios.get(`https://api.billtrackr.com/user/${this.state.user.app_metadata.userid}/settings`)
      ctx.commit('SET_USERSETTINGS', res.data)
    },
    async refreshPayees (ctx) {
      let res = await axios.get(`https://api.billtrackr.com/user/${this.state.user.app_metadata.userid}/payees`)
      ctx.commit('SET_PAYEES', res.data)
    },
    async refreshPayments (ctx) {
      let res = await axios.get(`https://api.billtrackr.com/user/${this.state.user.app_metadata.userid}/payments`)
      ctx.commit('SET_PAYMENTS', res.data)
    },
    async setInitialized (ctx) {
      ctx.commit('SET_INIT', true)
    },
    async nuxtServerInit ({ commit }) {
      if (!this.state.user) return
      let settings = await axios.get(`https://api.billtrackr.com/user/${this.state.user.app_metadata.userid}/settings`)
      let payees = await axios.get(`https://api.billtrackr.com/user/${this.state.user.app_metadata.userid}/payees`)
      let payments = await axios.get(`https://api.billtrackr.com/user/${this.state.user.app_metadata.userid}/payments`)
      commit('SET_USERSETTINGS', settings.data)
      commit('SET_PAYEES', payees.data)
      commit('SET_PAYMENTS', payments.data)
    }
  }
})

export default store
