<template>
    <div>
        <NovoRegistoInfo v-bind:assuntos="assuntos" v-on:create="criarRegisto" v-on:cancelar="cancelarCriacao"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import NovoRegistoInfo from '@/components/criar/NovoRegistoInfo.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'CriarRegisto',
    components: {
        NovoRegistoInfo,
        ErrorModal
    },
    data(){
        return {
            assuntos: [],
            msg: "",
            isErrorVisible: false
        }
    },
    created(){
        axios({
            method: 'get',
            url: 'http://localhost:3000/api/eventos'
        })
        .then((response) => {
            response.data.forEach(el => this.assuntos.push({tipoAssunto: 'Evento', assunto: el}));
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
            response.data.forEach(el => this.assuntos.push({tipoAssunto: 'Concurso', assunto: el}));
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
            url: 'http://localhost:3000/api/contratos'
        })
        .then((response) => {
            response.data.forEach(el => this.assuntos.push({tipoAssunto: 'Contrato', assunto: el}));
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
            response.data.forEach(el => this.assuntos.push({tipoAssunto: 'Politico', assunto: el}));
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
            response.data.forEach(el => this.assuntos.push({tipoAssunto: 'Empresario', assunto: el}));
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
            response.data.forEach(el => this.assuntos.push({tipoAssunto: 'Organizacao', assunto: el}));
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
            response.data.forEach(el => this.assuntos.push({tipoAssunto: 'CidadaoCreditado', assunto: el}));
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
            response.data.forEach(el => this.assuntos.push({tipoAssunto: 'CidadaoRegistado', assunto: el}));
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
    methods: {
        showError(msg){
            this.isErrorVisible = true;
            this.msg = msg;
        },
        hideError(){
            this.isErrorVisible = false;
            this.msg = "";
        },
        criarRegisto(registo){
            axios({
                method: 'post',
                url: "http://localhost:3000/api/registos",
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                },
                data: registo
            })
            .then((response) => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                this.showError("Registo criado com sucesso.");
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
        cancelarCriacao(){
            this.$router.push("/registos");  
        }
    }
}
</script>

<style scoped>

</style>