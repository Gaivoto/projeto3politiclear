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
    },
    node:{
      tipo: "",
      id: 0
    }
  },
  getters: {
    getUser(state){
      return state.user;
    },
    getNode(state){
      return state.node;
    }
  },
  mutations: {
    setUser(state, user){
      state.user = user;
    },
    setToken(state, token){
      state.user.tokens.accessToken = token;
    },
    setNode(state, node){
      state.node = node;
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [createPersistedState()]
})
