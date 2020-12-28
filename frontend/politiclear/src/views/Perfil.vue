<template>
    <div>
        <ProfileInfo v-bind:info="this.info.user"/>
        <button v-if="possivelAlterarPerfil" @click="toggleAlterar">Alterar perfil</button>
        <AlterarPerfilModal v-show="isAlterarVisible" v-bind:info="this.info.user" v-on:alterar="alterarPerfil" v-on:cancelar="toggleAlterar" v-on:erro="showError"/>
        <ProfileList v-bind:profile="this.info"/>
        <router-link v-if="possivelCriarRegisto" tag="button" to="/registos/create">Criar novo registo</router-link>
        <router-link v-if="possivelCriarOutros" tag="button" to="/concursos/create">Criar novo concurso</router-link>
        <router-link v-if="possivelCriarOutros" tag="button" to="/contratos/create">Criar novo contrato</router-link>
        <router-link v-if="possivelCriarOutros" tag="button" to="/eventos/create">Criar novo evento</router-link>
        <router-view></router-view>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import ProfileInfo from '@/components/info/ProfileInfo.vue'
import AlterarPerfilModal from '@/components/modals/AlterarPerfilModal.vue'
import ProfileList from '@/components/listasPagsId/ProfileList.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Perfil',
    components: {
        ProfileInfo,
        AlterarPerfilModal,
        ProfileList,
        ErrorModal
    },
    data(){
        return {
            msg: "",
            isErrorVisible: false,
            isAlterarVisible: false,
            info: {
                user: {

                }
            }
        }
    },
    created(){
        axios({
            method: 'get',
            url: `http://localhost:3000/api/profile/${this.$route.params.tipo}/${this.$route.params.id}`,
            headers: {
                Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                refreshToken: this.$store.getters.getUser.tokens.refreshToken
            }
        })
        .then((response) => {
            this.info = response.data;
            if(response.data.token){
                this.$store.commit('setToken', response.data.token);
            }
        })
        .catch(error => {
            if(error.response.data.details){
                this.showError(error.response.data.details[0].message);
            } else {
                this.showError(error.response.data);
            }
        });
    },
    computed: {
        possivelCriarRegisto: function(){
            return (this.$store.getters.getUser.info.tipo == "CidadaoCreditado");
        },
        possivelCriarOutros: function(){
            return (this.$store.getters.getUser.info.tipo == "Empresario" || this.$store.getters.getUser.info.tipo == "Politico");
        },
        possivelAlterarPerfil: function(){
            return (this.$store.getters.getUser.info.tipo == "CidadaoRegistado");
        }
    },
    methods: {
        alterarPerfil(user){
            this.toggleAlterar();
            axios({
                method: 'put',
                url: `http://localhost:3000/api/profile/${this.$route.params.tipo}/${this.$route.params.id}`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                },
                data: user
            })
            .then((response) => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                axios({
                    method: 'get',
                    url: `http://localhost:3000/api/profile/${this.$route.params.tipo}/${this.$route.params.id}`,
                    headers: {
                        Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                        refreshToken: this.$store.getters.getUser.tokens.refreshToken
                    }
                })
                .then((response) => {
                    this.info = response.data;
                    this.showError("Dados alterados com sucesso.");
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
            })
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
        }
    }
}
</script>

<style scoped>

</style>