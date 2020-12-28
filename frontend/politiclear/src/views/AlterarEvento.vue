<template>
    <div>
        <AlterarEventoInfo v-bind:evento="this.evento" v-bind:convidados="this.convidados" v-on:alterar="alterarEvento" v-on:cancelar="cancelarAlteracao"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import AlterarEventoInfo from '@/components/alterar/AlterarEventoInfo.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'AlterarEvento',
    components: {
        AlterarEventoInfo,
        ErrorModal
    },
    data(){
        return {
            convidados: [],
            evento: {},
            msg: "",
            isErrorVisible: false
        }
    },
    created(){
        axios({
            method: 'get',
            url: `http://localhost:3000/api/eventos/${this.$route.params.id}`
        })
        .then((response) => {
            this.evento = response.data;
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
            response.data.forEach(el => this.convidados.push({tipoConvidado: 'Politico', convidado: el}));
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
            response.data.forEach(el => this.convidados.push({tipoConvidado: 'Empresario', convidado: el}));
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
            response.data.forEach(el => this.convidados.push({tipoConvidado: 'Organizacao', convidado: el}));
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
            url: 'http://localhost:3000/api/cidadaosCreditados'
        })
        .then((response) => {
            response.data.forEach(el => this.convidados.push({tipoConvidado: 'CidadaoCreditado', convidado: el}));
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
            response.data.forEach(el => this.convidados.push({tipoConvidado: 'CidadaoRegistado', convidado: el}));
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
        alterarEvento(evento){
            axios({
                method: 'put',
                url: `http://localhost:3000/api/eventos/${this.$route.params.id}`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                },
                data: evento
            })
            .then((response) => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                this.showError("Evento alterado com sucesso.");
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
            this.$router.push("/eventos");  
        }
    }
}
</script>

<style scoped>

</style>