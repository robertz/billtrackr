
module.exports = {
  /*
   ** Middleware
   * */
  router: {
    middleware: 'check-auth'
  },
  /*
  ** Headers of the page
  */
  head: {
    title: 'BillTrackr',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'BillTrackr: Track your monthly bills' },
      { hid: 'og:title', property: 'og:title', content: 'BillTrackr: Track your monthly bills' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:url', property: 'og:url', content: 'https://billtrackr.com' },
      { hid: 'og:image:secure_url', property: 'og:image', content: 'https://billtrackr.com/images/victoria-heath-597279-unsplash.jpg' },
      { hid: 'og:description', property: 'og:description', content: 'BillTrackr helps you track all the people you pay each month so you never forget a payment again!' }
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  plugins: ['~/plugins/vuetify.js'],
  css: [
    '~/assets/style/app.styl'
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    vendor: [
      '~/plugins/vuetify.js'
    ],
    extractCSS: true,
    /*
    ** Run ESLint on save
    */
    extend (config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },
  env: {
    AUTH0_CLIENT_ID: 'Y6wvDIvXMncKaYRgcTLSn1oc8ujR5Hts',
    AUTH0_CLIENT_DOMAIN: 'kisdigital.auth0.com'
  }
}
