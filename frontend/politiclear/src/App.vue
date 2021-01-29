<template>
  <div id="app">
    <div id="nav">
        <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" tag="h3" to="/">Home</router-link>
        <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" tag="h3" to="/registos">Registos</router-link>
        <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" tag="h3" to="/eventos">Eventos</router-link>
        <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" tag="h3" to="/concursos">Concursos</router-link>
        <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" tag="h3" to="/contratos">Contratos</router-link>
        <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" tag="h3" to="/politicos">Políticos</router-link>
        <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" tag="h3" to="/empresarios">Empresários</router-link>
        <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" tag="h3" to="/organizacoes">Organizações</router-link>
        <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" tag="h3" class="lastLeft" to="/cidadaosCreditados">Cidadãos Creditados</router-link>
        <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" v-if="$store.getters.getUser.info.tipo == 'Administrador'" tag="h3" to="/areaAdm/users">Área de Admin</router-link>
        <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" v-if="$store.getters.getUser.info.tipo != '' && $store.getters.getUser.info.tipo != 'Administrador'" tag="h3" :to="{path: '/perfil/' + $store.getters.getUser.info.tipo + '/' + $store.getters.getUser.info.id}">Perfil</router-link>
        <h3 class="log" @mouseover="startHoverHeader" @mouseleave="finishHoverHeader" v-if="!$store.getters.getUser.info.id" @click="toggleLogin">Login</h3>
        <h3 class="log" @mouseover="startHoverHeader" @mouseleave="finishHoverHeader" v-if="$store.getters.getUser.info.id" @click="logout">Logout</h3>
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
    },
    startHoverHeader(e){
      e.srcElement.classList.add("linkHover");
    },
    finishHoverHeader(e){
      e.srcElement.classList.remove("linkHover");
    }
  }
}
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    background-color: #8CA3B4;
    height: 755px;
    width: 101.2%;
    margin: -10px;
  }

  .viewWrapper {
    height: 670px;
    background-color: #8CA3B4;
  }

  #nav {
    background-color: #405B6E;
    padding: 1.5% 2% 1.5% 2%;
  }

  #navAdm {
    margin: 0px 0px -15px -0px;
  }

  #nav > h3 {
    display: inline-block;
    margin: 0% 0.2% 0% 0.2%;
    padding: 6px 10px 6px 10px;
    font-size: 18px;
    color: white;
    border-radius: 15px;
    cursor: pointer;
  }

  #navAdm > h3 {
    display: inline-block;
    margin: 0% 0.2% 0% 0.2%;
    padding: 0px 10px 6px 10px;
    font-size: 18px;
    color: black;
    border-radius: 15px;
    cursor: pointer;
  }

  #nav > .lastLeft {
    margin-right: 6%;
  }

  .linkHover {
    background-color: #7291ad;
  }

  .linkHoverAdm {
    background-color: #B2B8CB;
  }

  .searchbar {
    background-color: #B2B8CB;
    padding: 20px 35px 45px 35px;
    width: 88%;
    border-radius: 20px;
    margin: auto;
    margin-bottom: 5px;
  }

  .searchbar > select {
    height: 25px;
    width: 20%;
    font-size: 16px;
    margin: -2px 20px 0px 5px;
    float: left;
    border-radius: 5px;
    background-color: #DDDDDD;
  }

  .searchbar > input {
    height: 18px;
    width: 20%;
    font-size: 16px;
    margin-right: 15px;
    float: right;
    border-radius: 5px;
    background-color: #DDDDDD;
  }

  .searchbar > label {
    font-size: 18px;
    font-weight: 600;
    float: left;
    border-radius: 5px;
  }

  .searchbar > button {
    height: 25px;
    font-size: 16px;
    width: 100px;
    float: right;
    background-color: #8B8A96;
    color: white;
    border: 2px solid #5A6378;
    border-radius: 5px;
  }

  button {
    height: 25px;
    font-size: 16px;
    background-color: #8B8A96;
    color: white;
    border: 2px solid #5A6378;
    border-radius: 5px;
  }

  .btnCriar {
    height: 35px;
    font-size: 18px;
  }

  .lista {
    overflow: auto;
    height: 550px;
    padding: 0% 10% 0% 10%;
    margin: auto;
    margin-top: 5px;
  }

  .listaComentarios {
    overflow: auto;
    width: 70%;
    height: 320px;
    margin: 5px 0px 5px 75px;
    float: right;
  }

  .listaAdm {
    height: 490px;
  }

  .card h4 {
    text-align: justify;
    margin: 10px;
  }

  .card b {
    font-size: 17px;
    color: black;
  }

  .card {
    margin: 10px 0px 10px 0px;
    padding: 10px 30px 10px 30px;
    background-color: #cccccc;
    border-radius: 20px;
    cursor: pointer;
  }

  .card button {
    margin-left: 10px;
    margin-right: 10px;
  }

  hr {
    height: 5px;
    max-width: 100%;
    background-color: #888888;
    margin: 20px 40px 20px 40px;
  }

  .element {
    display: inline;
  }

  .info {
    float: left;
    padding: 10px 0px 10px 25px;
    width: 96%;
    background-color: #9e8a7c;
    color: black;
    border-radius: 80px;
    margin: 10px 0px 10px 20px;
  }

  .info h2, .info h3 {
    text-align: center;
    width: 99%;
  }

  .info h2 {
    font-size: 18px;
  }

  .info h3 {
    font-size: 16px;
  }

  .info b {
    font-size: 18px;
  }

  .listaInfo {
    margin: 10px 10px 0px 10px;
    display: flex;
    height: 300px;
  }

  .listaInfo .divWrapper {
    width: 280px;
    text-align: justify;
    margin: 0px 10px 0px 10px;
    padding: 0px 15px 0px 15px;
    background-color: #cccccc;
    border-radius: 20px;
    overflow: auto;
  }

  .listaInfo .divWrapper > h3 {
    color: black;
  }

  .listaInfo li {
    text-align: left;
    margin: 5px 0px 5px 0px;
    cursor: pointer;
  }

  .listaInfo .subTopic {
    margin-left: 15px;
    font-size: 16px;
  }

  button {
    cursor: pointer;
  }

  textarea {
    font-size: 16px;
    font-family: Avenir, Helvetica, Arial, sans-serif;
  }

  .clicked {
    transform: scale(0.95);
  }

  .wrapperAdm {
    background-color: #8CA3B4;
    height: 690px;  
  }
</style>