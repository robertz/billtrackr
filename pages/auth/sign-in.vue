<template>
    <div id="auth0-lock"></div>
</template>

<script>
import { show } from '~/utils/lock'
export default {
  layout: 'sign-in',
  middleware: 'anonymous',
  mounted () {
    show('auth0-lock')
  }
}
</script>


