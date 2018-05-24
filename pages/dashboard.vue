<template>

  <v-layout>
    <v-flex xs12>

        <v-container v-bind="{ [`grid-list-md`]: true }" fluid>
          <v-layout row wrap>
            <v-flex
              v-for="n in 9"
              :key="n"
              xs4
            >
              <v-card flat tile class="elevation-1">
                <v-card-text>
                  Card Text
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>



    </v-flex>
  </v-layout>

</template>

<script>
export default {
  middleware: 'authenticated'
}
</script>
