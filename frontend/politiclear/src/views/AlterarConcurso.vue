<template>
    <div>
        <AlterarConcursoInfo v-bind:concurso="this.concurso" v-bind:participantes="this.participantes" v-on:alterar="alterarConcurso" v-on:cancelar="cancelarAlteracao"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import AlterarConcursoInfo from '@/components/alterar/AlterarConcursoInfo.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'AlterarConcurso',
    components: {
        AlterarConcursoInfo,
        ErrorModal
    },
    data(){
        return {
            participantes: [],
            concurso: {},
            msg: "",
            isErrorVisible: false
        }
    },
    created(){
        axios({
            method: 'get',
            url: `http://localhost:3000/api/concursos/${this.$route.params.id}`
        })
        .then((response) => {
            this.concurso = response.data;
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
            url: 'http://localhost:3000/api/politicos'
        })
        .then((response) => {
            response.data.forEach(el => this.participantes.push({tipoParticipante: 'Politico', participante: el}));
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
            url: 'http://localhost:3000/api/empresarios'
        })
        .then((response) => {
            response.data.forEach(el => this.participantes.push({tipoParticipante: 'Empresario', participante: el}));
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
            url: 'http://localhost:3000/api/organizacoes'
        })
        .then((response) => {
            response.data.forEach(el => this.participantes.push({tipoParticipante: 'Organizacao', participante: el}));
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
            url: 'http://localhost:3000/api/cidadaosRegistados',
            headers: {
                Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                refreshToken: this.$store.getters.getUser.tokens.refreshToken
            }
        })
        .then((response) => {
            if(response.data.token){
                this.$store.commit('setToken', response.data.token);
            }
            response.data.forEach(el => this.participantes.push({tipoParticipante: 'CidadaoRegistado', participante: el}));
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
        alterarConcurso(concurso){
            axios({
                method: 'put',
                url: `http://localhost:3000/api/concursos/${this.$route.params.id}`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                },
                data: concurso
            })
            .then((response) => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                this.showError("Concurso alterado com sucesso.");
            })
            .catch(error =>{
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
            });  
        },
        showError(msg){
            this.isErrorVisible = true;
            this.msg = msg;
        },
        hideError(){
            this.isErrorVisible = false;
            this.msg = "";
        },
        cancelarAlteracao(){
            this.$router.push("/concursos");  
        }
    }
}
</script>

<style scoped>

</style>