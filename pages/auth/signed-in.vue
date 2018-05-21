<template>
  <div></div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { setToken, checkSecret, extractInfoFromHash } from '~/utils/auth'

export default {
  layout: 'anon',
  computed: {
    ...mapState(['userSettings']),
    ...mapGetters(['isAuthenticated', 'loggedUser'])
  },
  async mounted () {
    const { token, secret } = extractInfoFromHash()
    if (!checkSecret(secret) || !token) {
      console.error('Something happened with the Sign In request')
    }
    setToken(token)
    this.$router.replace('/dashboard')
  }
}
</script>