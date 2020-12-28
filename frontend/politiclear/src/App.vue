<template>
  <div id="app">
    <div id="nav">
      <router-link tag="h3" to="/">Home</router-link>
      <router-link tag="h3" to="/registos">Registos</router-link>
      <router-link tag="h3" to="/eventos">Eventos</router-link>
      <router-link tag="h3" to="/concursos">Concursos</router-link>
      <router-link tag="h3" to="/contratos">Contratos</router-link>
      <router-link tag="h3" to="/politicos">Políticos</router-link>
      <router-link tag="h3" to="/empresarios">Empresários</router-link>
      <router-link tag="h3" to="/organizacoes">Organizações</router-link>
      <router-link tag="h3" to="/cidadaosCreditados">Cidadãos Creditados</router-link>
      <router-link v-if="$store.getters.getUser.info.tipo == 'Administrador'" tag="h3" to="/areaAdm/users">Área de Administrador</router-link>
      <router-link v-if="$store.getters.getUser.info.tipo != '' && $store.getters.getUser.info.tipo != 'Administrador'" tag="h3" :to="{path: '/perfil/' + $store.getters.getUser.info.tipo + '/' + $store.getters.getUser.info.id}">Perfil</router-link>
      <h3 v-if="!$store.getters.getUser.info.id" @click="toggleLogin">Login</h3>
      <h3 v-if="$store.getters.getUser.info.id" @click="logout">Logout</h3>
    </div>
    <router-view/>
    <LoginModal v-show="isLoginVisible" v-on:fechar="toggleLogin" v-on:registar="toggleBoth" v-on:erro="showError" v-on:update-user="updateUser"/>
    <RegisterModal v-show="isRegisterVisible" v-on:fechar="toggleRegister" v-on:erro="showError"/>
    <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
  </div>
</template>

<script>
import axios from 'axios'
import LoginModal from '@/components/modals/LoginModal.vue'
import RegisterModal from '@/components/modals/RegisterModal.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
  name: 'App',
  components: {
    LoginModal,
    RegisterModal,
    ErrorModal
  },
  data(){
    return {
      isLoginVisible: false,
      isRegisterVisible: false,
      isErrorVisible: false,
      msg: ""
    }
  },
  methods: {
    toggleLogin(){
      this.isLoginVisible = !this.isLoginVisible;
    },
    toggleRegister(){
      this.isRegisterVisible = !this.isRegisterVisible;
    },
    toggleBoth(){
      this.toggleLogin();
      this.toggleRegister();
    },
    updateUser(info){
      this.$store.commit('setUser', info);
      this.showError(`Logged in como ${this.$store.getters.getUser.info.username} (${this.$store.getters.getUser.info.tipo})`);
      this.toggleLogin();
    },
    logout(){
      axios({
        method: 'delete',
        url: "http://localhost:3000/api/logout",
        headers: {
          Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
          refreshToken: this.$store.getters.getUser.tokens.refreshToken
        }
      })
        .then((response) => {
          this.$store.commit('setUser', {info: {tipo: ""}});
          this.showError("Logged out.");
          if(this.$router.history.current.path != "/"){
            this.$router.push("/");  
          }
        })
        .catch((error) => {
          if(error.response.data.details){
            this.showError(error.response.data.details[0].message);
          } else {
            this.showError(error.response.data);
          }
        })
    },
    showError(msg){
      this.isErrorVisible = true;
      this.msg = msg;
    },
    hideError(){
      this.isErrorVisible = false;
      this.msg = "";
    }
  }
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

h3 {
    display:inline;
    margin-left: 10px;
    margin-right: 10px;
}
</style>