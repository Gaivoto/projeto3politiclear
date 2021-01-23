<template>
    <div class="wrapperAdm">
        <div id="navAdm">
            <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" tag="h3" to="/areaAdm/users">Utilizadores</router-link>
            <router-link @mouseover.native="startHoverHeader" @mouseleave.native="finishHoverHeader" tag="h3" to="/areaAdm/orgs">Organizações</router-link>
            <router-view></router-view>
        </div>
        <UsersSearch class="searchbar" v-on:pesquisar="updateList"/>
        <button class="btnCriar" @click="toggleCriar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Criar novo utilizador</button>
        <ElementList class="lista listaAdm" tipo="UserCard" v-bind:lista="this.lista" v-on:alterar-user="iniciarAlterar" v-on:desativar-user="desativarUser"/>
        <CriarUserModal v-show="isCriarVisible" v-bind:partidos="partidos" v-on:criar="criarUser" v-on:cancelar="toggleCriar" v-on:erro="showError"/>
        <AlterarUserModal v-show="isAlterarVisible" v-bind:user="user" v-bind:partidos="partidos" v-on:alterar="alterarUser" v-on:erro="showError" v-on:cancelar="toggleAlterar"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import UsersSearch from '@/components/searchbars/UsersSearch.vue'
import ElementList from '@/components/ElementList.vue'
import CriarUserModal from '@/components/modals/CriarUserModal.vue'
import AlterarUserModal from '@/components/modals/AlterarUserModal.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'AreaAdmUsers',
    components: {
        UsersSearch,
        ElementList,
        CriarUserModal,
        AlterarUserModal,
        ErrorModal
    },
    data(){
        return{
            user: {},
            lista: [],
            partidos: [],
            msg: "",
            isCriarVisible: false,
            isAlterarVisible: false,
            isErrorVisible: false
        }
    },
    created(){
        axios({
            method: 'get',
            url: 'http://localhost:3000/api/organizacoes?tipo=Partido'
        })
        .then((response) => {
            response.data.forEach(el => this.partidos.push(el));
        })
        .catch(error => {
            if(error.response.data.details){
                this.showError(error.response.data.details[0].message);
            } else {
                this.showError(error.response.data);
            }
        });

        this.loadLista("");
    },
    methods: {
        criarUser(user){
            this.toggleCriar();
    
            axios({
                method: 'post',
                url: `http://localhost:3000/api/${user.tipo}/registar`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                },
                data: user.info
            })
            .then(response => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                this.showError("Utilizador criado com sucesso.");

                this.lista = [];

                this.loadLista("");
            })
            .catch(error =>{
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
                if(error.response.status == "403"){
                    this.$store.commit('setUser', {info: {tipo: ""}, tokens: {}});
                }
            });
        },
        iniciarAlterar(user){

            axios({
                method: 'get',
                url: `http://localhost:3000/api/profile/${user.tipo}/${user.id}`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                }
            })
            .then(response => this.user = response.data)
            .catch(error => {
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
                if(error.response.status == "403"){
                    this.$store.commit('setUser', {info: {tipo: ""}, tokens: {}});
                }
            });

            this.toggleAlterar();
        },
        alterarUser(user){
            this.toggleAlterar();

            axios({
                method: 'put',
                url: `http://localhost:3000/api/profile/${user.tipo}/${user.id}`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                },
                data: user.info
            })
            .then(response => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                this.showError("Utilizador alterado com sucesso.");

                this.lista = [];

                this.loadLista("");
            })
            .catch(error =>{
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
                if(error.response.status == "403"){
                    this.$store.commit('setUser', {info: {tipo: ""}, tokens: {}});
                }
            });
        },
        desativarUser(user){
            axios({
                method: 'put',
                url: `http://localhost:3000/api/profile/${user.tipo}/${user.id}/ativar`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                },
                data: user.user
            })
            .then(response => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                this.showError("Utilizador ativado/desativado com sucesso.");

                this.lista = [];

                this.loadLista("");
            })
            .catch(error =>{
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
                if(error.response.status == "403"){
                    this.$store.commit('setUser', {info: {tipo: ""}, tokens: {}});
                }
            });
        },
        updateList(pesquisa){

            this.lista = [];

            if(pesquisa.tipoPesquisa != ""){
                var url = `http://localhost:3000/api/${pesquisa.tipoPesquisa}`;

                if(pesquisa.textoPesquisa != ""){
                    url += `?search=${pesquisa.textoPesquisa}`;
                }

                axios({
                    method: 'get',
                    url: url,
                    headers: {
                        Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                        refreshToken: this.$store.getters.getUser.tokens.refreshToken
                    }
                })
                .then((response) => {
                    response.data.forEach(el => this.lista.push({tipoUser: pesquisa.tipo, user: el}));
                })
                .catch(error => {
                    if(error.response.data.details){
                        this.showError(error.response.data.details[0].message);
                    } else {
                        this.showError(error.response.data);
                    }
                    if(error.response.status == "403"){
                        this.$store.commit('setUser', {info: {tipo: ""}, tokens: {}});
                    }
                });
            }

            if(pesquisa.tipoPesquisa == ""){
                if(pesquisa.textoPesquisa != ""){
                    this.loadLista(pesquisa.textoPesquisa);
                } else {
                    this.loadLista("");
                }
            }
        },
        loadLista(search){
            axios({
                method: 'get',
                url: search != "" ? `http://localhost:3000/api/politicos?search=${search}` : 'http://localhost:3000/api/politicos'
            })
            .then((response) => {
                response.data.forEach(el => this.lista.push({tipoUser: 'Politico', user: el}));
            })
            .catch(error => {
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
            });

            axios({
                method: 'get',
                url: search != "" ? `http://localhost:3000/api/empresarios?search=${search}` : 'http://localhost:3000/api/empresarios'
            })
            .then((response) => {
                response.data.forEach(el => this.lista.push({tipoUser: 'Empresario', user: el}));
            })
            .catch(error => {
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
            });

            axios({
                method: 'get',
                url: search != "" ? `http://localhost:3000/api/cidadaosCreditados?search=${search}` : 'http://localhost:3000/api/cidadaosCreditados'
            })
            .then((response) => {
                response.data.forEach(el => this.lista.push({tipoUser: 'CidadaoCreditado', user: el}));
            })
            .catch(error => {
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
            });

            axios({
                method: 'get',
                url: search != "" ? `http://localhost:3000/api/cidadaosRegistados?search=${search}` : 'http://localhost:3000/api/cidadaosRegistados',
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                }
            })
            .then((response) => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                response.data.forEach(el => this.lista.push({tipoUser: 'CidadaoRegistado', user: el}));
            })
            .catch(error => {
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
                if(error.response.status == "403"){
                    this.$store.commit('setUser', {info: {tipo: ""}, tokens: {}});
                }
            });

            axios({
                method: 'get',
                url: search != "" ? `http://localhost:3000/api/administradores?search=${search}` : 'http://localhost:3000/api/administradores',
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                }
            })
            .then((response) => {
                response.data.forEach(el => this.lista.push({tipoUser: 'Administrador', user: el}));
            })
            .catch(error => {
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
                if(error.response.status == "403"){
                    this.$store.commit('setUser', {info: {tipo: ""}, tokens: {}});
                }
            });
        },
        toggleCriar(){
            this.isCriarVisible = !this.isCriarVisible;
        },
        toggleAlterar(){
            this.isAlterarVisible = !this.isAlterarVisible;
        },
        showError(msg){
            this.isErrorVisible = true;
            this.msg = msg;
        },
        hideError(){
            this.isErrorVisible = false;
            this.msg = "";
        },
        startBtnClick(e){
            if(e.button == 0){
                e.srcElement.classList.add("clicked");
            }
            
        },
        finishBtnClick(e){
            if(e.button == 0){
                e.srcElement.classList.remove("clicked");  
            }
        },
        startHoverHeader(e){
            e.srcElement.classList.add("linkHoverAdm");
        },
        finishHoverHeader(e){
            e.srcElement.classList.remove("linkHoverAdm");
        }
    }
}
</script>

<style scoped>

#navAdm {
  padding: 30px;
}

#navAdm a {
  font-weight: bold;
  color: #2c3e50;
}

h3 {
    display:inline;
    margin-left: 10px;
    margin-right: 10px;
}
</style>