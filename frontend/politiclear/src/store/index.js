import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user:{
      info:{
        tipo: ""
      },
      tokens: {
        
      }
    }
  },
  getters: {
    getUser(state){
      return state.user;
    }
  },
  mutations: {
    setUser(state, user){
      state.user = user;
    },
    setToken(state, token){
      state.user.tokens.accessToken = token;
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [createPersistedState()]
})
