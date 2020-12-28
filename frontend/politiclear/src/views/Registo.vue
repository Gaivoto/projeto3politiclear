<template>
    <div>
        <RegistoInfo v-bind:info="this.info"/>
        <NovoVotoInfo v-if="possivelVotarComentar" v-on:votar="criarVoto" v-bind:votos="this.info.votos"/>
        <NovoComentarioInfo v-if="possivelVotarComentar" v-on:comentar="criarComentario"/>
        <ElementList tipo="ComentarioCard" v-bind:lista="this.info.comentarios" v-on:apagar="apagarComentario"/>
        <RegistoInfoLists v-bind:assuntos="this.info.assuntos"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import RegistoInfo from '@/components/info/RegistoInfo.vue'
import NovoVotoInfo from '@/components/criar/NovoVotoInfo.vue'
import NovoComentarioInfo from '@/components/criar/NovoComentarioInfo.vue'
import RegistoInfoLists from '@/components/listasPagsId/RegistoInfoLists.vue'
import ElementList from '@/components/ElementList.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Registo',
    components: {
        RegistoInfo,
        NovoVotoInfo,
        NovoComentarioInfo,
        RegistoInfoLists,
        ElementList,
        ErrorModal
    },
    data(){
        return{
            info: { votos: []},
            msg: "",
            isErrorVisible: false
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
            });
        },
        criarComentario(comentario){
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
            })
        }
    }
}
</script>

<style scoped>

</style>