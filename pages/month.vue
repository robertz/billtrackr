<template>
  <v-container fluid>

  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  middleware: 'authenticated',
  computed: {
    ...mapState(['payees', 'payments']),
    ...mapGetters(['loggedUser'])
  }
}
</script>