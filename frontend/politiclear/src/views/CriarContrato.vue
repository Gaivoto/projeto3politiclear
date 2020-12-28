<template>
    <div>
        <NovoContratoInfo v-bind:assinaturas="assinaturas" v-bind:organizacoes="organizacoes" v-bind:concursos="concursos" v-on:create="criarContrato" v-on:erro="showError" v-on:cancelar="cancelarCriacao"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import NovoContratoInfo from '@/components/criar/NovoContratoInfo.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'CriarContrato',
    components: {
        NovoContratoInfo,
        ErrorModal
    },
    data(){
        return {
            assinaturas: [],
            concursos: [],
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
            response.data.forEach(el => this.assinaturas.push({tipoAssinatura: 'Politico', assinatura: el}));
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
            response.data.forEach(el => this.assinaturas.push({tipoAssinatura: 'Empresario', assinatura: el}));
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
            response.data.forEach(el => this.assinaturas.push({tipoAssinatura: 'Organizacao', assinatura: el}));
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
            response.data.forEach(el => this.assinaturas.push({tipoAssinatura: 'CidadaoRegistado', assinatura: el}));
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
            url: 'http://localhost:3000/api/concursos'
        })
        .then((response) => {
            response.data.forEach(el => this.concursos.push(el));
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
        criarContrato(contrato){
            axios({
                method: 'post',
                url: "http://localhost:3000/api/contratos",
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                },
                data: contrato
            })
            .then((response) => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                this.showError("Contrato criado com sucesso.");
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
            this.$router.push("/contratos");  
        }
    }
}
</script>

<style scoped>

</style>