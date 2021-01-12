<template>
    <div>
        <ProfileInfo class="info" v-bind:info="this.info.user"/>
        <button class="btn" @click="node" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Ver rede de contactos</button>
        <button class="btn" v-if="possivelAlterarPerfil" @click="toggleAlterar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Alterar perfil</button>
        <AlterarPerfilModal v-show="isAlterarVisible" v-bind:info="this.info.user" v-on:alterar="alterarPerfil" v-on:cancelar="toggleAlterar" v-on:erro="showError"/>
        <ProfileList class="listaInfo" v-bind:profile="this.info"/>
        <router-link id="btnNovoRegisto" class="btnCriar" v-if="possivelCriarRegisto" tag="button" @mousedown.native="startBtnClick" @mouseup.native="finishBtnClick" @mouseleave.native="finishBtnClick" to="/registos/create">Criar novo registo</router-link>
        <router-link id="btnNovoConcurso" class="btnCriar" v-if="possivelCriarOutros" tag="button" @mousedown.native="startBtnClick" @mouseup.native="finishBtnClick" @mouseleave.native="finishBtnClick" to="/concursos/create">Criar novo concurso</router-link>
        <router-link id="btnNovoContrato" class="btnCriar" v-if="possivelCriarOutros" tag="button" @mousedown.native="startBtnClick" @mouseup.native="finishBtnClick" @mouseleave.native="finishBtnClick" to="/contratos/create">Criar novo contrato</router-link>
        <router-link id="btnNovoEvento" class="btnCriar" v-if="possivelCriarOutros" tag="button" @mousedown.native="startBtnClick" @mouseup.native="finishBtnClick" @mouseleave.native="finishBtnClick" to="/eventos/create">Criar novo evento</router-link>
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
            if(error.response.status == "403"){
                this.$store.commit('setUser', {info: {tipo: ""}, tokens: {}});
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
        node(){
            this.$store.commit('setNode', {tipo: this.info.user.tipoUser, id: this.info.user.id});
            this.$router.push("/grafo");
        },
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
                    if(error.response.status == "403"){
                        this.$store.commit('setUser', {info: {tipo: ""}, tokens: {}});
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
    #btnNovoRegisto {
        position: absolute;
        left: 80px;
        top: 670px;
    }

    #btnNovoConcurso {
        position: absolute;
        left: 680px;
        top: 670px;
    }

    #btnNovoContrato {
        position: absolute;
        left: 1000px;
        top: 670px;
    }

    #btnNovoEvento {
        position: absolute;
        left: 1310px;
        top: 670px;
    }

    .btn {
        margin: 20px 10px 20px 10px;
        width: 200px;
    }
</style>