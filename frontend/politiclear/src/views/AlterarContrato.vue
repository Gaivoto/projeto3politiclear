<template>
    <div>
        <AlterarContratoInfo v-bind:contrato="this.contrato" v-bind:assinaturas="this.assinaturas" v-bind:concursos="this.concursos" v-on:alterar="alterarContrato" v-on:erro="showError" v-on:cancelar="cancelarAlteracao"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import AlterarContratoInfo from '@/components/alterar/AlterarContratoInfo.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'AlterarContrato',
    components: {
        AlterarContratoInfo,
        ErrorModal
    },
    data(){
        return {
            assinaturas: [],
            concursos: [],
            contrato: {},
            msg: "",
            isErrorVisible: false
        }
    },
    created(){
        axios({
            method: 'get',
            url: `http://localhost:3000/api/contratos/${this.$route.params.id}`
        })
        .then((response) => {
            this.contrato = response.data;
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
            if(error.response.status == "403"){
                this.$store.commit('setUser', {info: {tipo: ""}, tokens: {}});
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
    },
    methods: {
        alterarContrato(contrato){
            axios({
                method: 'put',
                url: `http://localhost:3000/api/contratos/${this.$route.params.id}`,
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
                this.showError("Contrato alterado com sucesso.");
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
        showError(msg){
            this.isErrorVisible = true;
            this.msg = msg;
        },
        hideError(){
            this.isErrorVisible = false;
            this.msg = "";
        },
        cancelarAlteracao(){
            this.$router.push("/contratos");  
        }
    }
}
</script>

<style scoped>

</style>