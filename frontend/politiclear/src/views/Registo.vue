<template>
    <div>
        <RegistoInfo class="info" v-bind:info="this.info"/>
        <button @click="node" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Ver rede de contactos</button>
        <NovoVotoInfo v-if="possivelVotarComentar" v-on:votar="criarVoto" v-bind:votos="this.info.votos"/>
        <CriarComentarioModal v-if="isCreatingComment" v-on:comentar="criarComentario" v-on:fechar="toggleComentario"/>
        <button v-if="!isCreatingComment && possivelVotarComentar" @click="toggleComentario" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Criar comentário</button>
        <div class="inner">
            <RegistoInfoLists class="listaInfo" v-bind:assuntos="this.info.assuntos"/>   
            <ElementList tipo="ComentarioCard" class="listaComentarios" v-bind:lista="this.info.comentarios" v-on:apagar="apagarComentario"/> 
        </div>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import RegistoInfo from '@/components/info/RegistoInfo.vue'
import NovoVotoInfo from '@/components/criar/NovoVotoInfo.vue'
import CriarComentarioModal from '@/components/modals/CriarComentarioModal.vue'
import RegistoInfoLists from '@/components/listasPagsId/RegistoInfoLists.vue'
import ElementList from '@/components/ElementList.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Registo',
    components: {
        RegistoInfo,
        NovoVotoInfo,
        CriarComentarioModal,
        RegistoInfoLists,
        ElementList,
        ErrorModal
    },
    data(){
        return{
            info: { votos: []},
            msg: "",
            isErrorVisible: false,
            isCreatingComment: false
        }
    },
    created(){
        axios.get(`http://localhost:3000/api/registos/${this.$route.params.id}`)
            .then((response) => {
                this.info = response.data;
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
        possivelVotarComentar: function(){
            return (this.$store.getters.getUser.info.tipo != "" && this.$store.getters.getUser.info.tipo != "Administrador");
        }
    },
    methods: {
        node(){
            this.$store.commit('setNode', {tipo: "Registo", id: this.info.registo.id});
            this.$router.push("/grafo");
        },
        showError(msg){
            this.isErrorVisible = true;
            this.msg = msg;
        },
        hideError(){
            this.isErrorVisible = false;
            this.msg = "";
        },
        criarVoto(valor){
            axios({
                method: 'post',
                url: `http://localhost:3000/api/registos/${this.$route.params.id}/votar`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                },
                data: {
                    valor: valor
                }
            })
            .then((response) => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                axios.get(`http://localhost:3000/api/registos/${this.$route.params.id}`)
                .then((response) => {
                    this.info = response.data;
                })
                .catch(error => {
                    if(error.response.data.details){
                        this.showError(error.response.data.details[0].message);
                    } else {
                        this.showError(error.response.data);
                    }
                });
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
        criarComentario(comentario){
            this.toggleComentario();
            
            axios({
                method: 'post',
                url: `http://localhost:3000/api/registos/${this.$route.params.id}/comentarios`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                },
                data: {
                    descricao: comentario
                }
            })
            .then((response) => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                axios.get(`http://localhost:3000/api/registos/${this.$route.params.id}`)
                .then((response) => {
                    this.info = response.data;
                })
                .catch(error => {
                    if(error.response.data.details){
                        this.showError(error.response.data.details[0].message);
                    } else {
                        this.showError(error.response.data);
                    }
                });
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
        apagarComentario(id){
            axios({
                method: 'delete',
                url: `http://localhost:3000/api/registos/${this.$route.params.id}/comentarios/${id}`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                }
            })
            .then((response) => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                axios.get(`http://localhost:3000/api/registos/${this.$route.params.id}`)
                .then((response) => {
                    this.info = response.data;
                })
                .catch(error => {
                    if(error.response.data.details){
                        this.showError(error.response.data.details[0].message);
                    } else {
                        this.showError(error.response.data);
                    }
                });
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
            })
        },
        toggleComentario(){
            this.isCreatingComment = !this.isCreatingComment;
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
    .inner {
        display: flex;
    }
</style>