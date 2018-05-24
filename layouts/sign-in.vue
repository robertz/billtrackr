<template>
  <v-app dark>
    <v-content>
      <v-container fluid class="wrapper">
          <nuxt/>
      </v-container>
    </v-content>
  </v-app>
</template>

<style scoped>
  .wrapper {
    background: url(/images/aidan-bartos-313782-unsplash.jpg) no-repeat center center fixed;
    background-size: cover; 
    height: 100%;
    overflow: hidden;
  }
  #auth0-lock {
    padding-top: 48px;
  }
</style>
