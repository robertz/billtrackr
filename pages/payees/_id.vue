<template>

  <v-flex fill-height>
    <v-card>
      <v-card-title primary-title>
        <div class="headline">{{ current.name }}</div>
      </v-card-title>
      <v-card-text>
          <v-layout row wrap>
            <v-flex xs6>
              One
            </v-flex>
            <v-flex xs6>
              Two
            </v-flex>
          </v-layout>
        </v-card-text>
    </v-card>
  </v-flex>
  
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  middleware: 'authenticated',
  data () {
    return {

    }
  },
  computed: {
    current () {
      return this.payees.filter(payee => payee._id === this.$route.params.id)[0] || {}
    },
    ...mapState(['payees']),
    ...mapGetters(['loggedUser'])
  }
}
</script>
