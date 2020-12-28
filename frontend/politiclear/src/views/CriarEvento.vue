<template>
    <div>
        <NovoEventoInfo v-bind:convidados="convidados" v-bind:organizacoes="organizacoes" v-on:create="criarEvento" v-on:cancelar="cancelarCriacao"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import NovoEventoInfo from '@/components/criar/NovoEventoInfo.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'CriarEvento',
    components: {
        NovoEventoInfo,
        ErrorModal
    },
    data(){
        return {
            convidados: [],
            organizacoes: [],
            msg: "",
            isErrorVisible: false
        }
    },
    created(){
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

        axios({
            method: 'get',
            url: `http://localhost:3000/api/profile/${this.$store.getters.getUser.info.tipo}/${this.$store.getters.getUser.info.id}`,
            headers: {
                Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                refreshToken: this.$store.getters.getUser.tokens.refreshToken
            }
        })
        .then((response) => {
            response.data.organizacoes.forEach(el => this.organizacoes.push(el));
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
        criarEvento(evento){
            axios({
                method: 'post',
                url: "http://localhost:3000/api/eventos",
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
                this.showError("Evento criado com sucesso.");
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
        cancelarCriacao(){
            this.$router.push("/eventos");  
        }
    }
}
</script>

<style scoped>

</style>