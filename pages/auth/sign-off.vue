<template>
  <div></div>
</template>

<script>
import { unsetToken } from '~/utils/auth'
import { logout } from '~/utils/lock'

export default {
  layout: 'anon',
  mounted () {
    unsetToken()
    logout()
  }
}
</script>
