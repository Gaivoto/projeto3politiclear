<template>
    <div>
        <div id="navAdm">
            <router-link tag="h3" to="/areaAdm/users">Utilizadores</router-link>
            <router-link tag="h3" to="/areaAdm/orgs">Organizações</router-link>
            <router-view></router-view>
        </div>
        <OrganizacoesSearch class="searchbar" v-on:pesquisar="updateList"/>
        <button class="btnCriar" @click="toggleCriar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Criar nova organização</button>
        <ElementList class="lista listaAdm" tipo="OrganizacaoCard" v-bind:lista="this.lista" v-on:alterar-org="iniciarAlterar"/>
        <CriarOrgModal v-show="isCriarVisible" v-on:criar="criarOrganizacao" v-on:cancelar="toggleCriar"/>
        <AlterarOrgModal v-show="isAlterarVisible" v-bind:org="org" v-on:alterar="alterarOrganizacao" v-on:error="showError" v-on:cancelar="toggleAlterar"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import OrganizacoesSearch from '@/components/searchbars/OrganizacoesSearch.vue'
import ElementList from '@/components/ElementList.vue'
import CriarOrgModal from '@/components/modals/CriarOrgModal.vue'
import AlterarOrgModal from '@/components/modals/AlterarOrgModal.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'AreaAdmOrgs',
    components: {
        OrganizacoesSearch,
        ElementList,
        CriarOrgModal,
        AlterarOrgModal,
        ErrorModal
    },
    data(){
        return{
            org: {},
            lista: [],
            msg: "",
            isCriarVisible: false,
            isAlterarVisible: false,
            isErrorVisible: false
        }
    },
    created(){
        axios.get("http://localhost:3000/api/organizacoes")
            .then((response) => {
                response.data.forEach(element => {
                    this.lista.push(element);
                });
            })
            .catch(error => {
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
            });
    },
    methods: {
        criarOrganizacao(organizacao){
            this.toggleCriar();

            axios({
                method: 'post',
                url: "http://localhost:3000/api/organizacoes",
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                },
                data: organizacao
            })
            .then(response => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                this.showError("Organização criada com sucesso.");

                this.lista = [];

                axios.get("http://localhost:3000/api/organizacoes")
                    .then((response) => {
                        response.data.forEach(element => {
                            this.lista.push(element);
                        });
                    })
                    .catch(error => {
                        if(error.response.data.details){
                            this.showError(error.response.data.details[0].message);
                        } else {
                            this.showError(error.response.data);
                        }
                    });
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
        iniciarAlterar(id){

            axios({
                method: 'get',
                url: `http://localhost:3000/api/organizacoes/${id}`
            })
            .then(response => this.org = response.data.organizacao)
            .catch(error => {
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
            });

            this.toggleAlterar();
        },
        alterarOrganizacao(organizacao){
            this.toggleAlterar();

            axios({
                method: 'put',
                url: `http://localhost:3000/api/organizacoes/${organizacao.id}`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                },
                data: organizacao.organizacao
            })
            .then(response => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                this.showError("Organização alterada com sucesso.");

                this.lista = [];

                axios.get("http://localhost:3000/api/organizacoes")
                    .then((response) => {
                        response.data.forEach(element => {
                            this.lista.push(element);
                        });
                    })
                    .catch(error => {
                        if(error.response.data.details){
                            this.showError(error.response.data.details[0].message);
                        } else {
                            this.showError(error.response.data);
                        }
                    });
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

            var url = "http://localhost:3000/api/organizacoes";

            if(pesquisa.textoPesquisa != ""){
                url += `?search=${pesquisa.textoPesquisa}`;
            }

            axios.get(url)
                .then((response) => {
                    response.data.forEach(element => {
                        this.lista.push(element);
                    });
                })
                .catch(error => {
                    if(error.response.data.details){
                        this.showError(error.response.data.details[0].message);
                    } else {
                        this.showError(error.response.data);
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