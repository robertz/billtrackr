/* eslint-disable */
import { unsetToken } from '~/utils/auth'

export default function ({ store, redirect }) {
  if (store.getters.isAuthenticated) {
    // session was authenticated but has timed out
    if (store.getters.loggedUser.exp < Date.now() / 1000) {
      unsetToken()
      return
    }
    return redirect('/dashboard')
  }
}
