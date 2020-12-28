<template>
    <div>
        <OrganizacaoInfo v-bind:info="this.profile"/>
        <button v-if="possivelAssociar" @click="toggleAssociar">Associar-me a esta organização</button>
        <button v-if="possivelDesassociar" @click="toggleAssociar">Desassociar-me desta organização</button>
        <OrganizacaoInfoLists v-bind:info="this.profile"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import OrganizacaoInfo from '@/components/info/OrganizacaoInfo.vue'
import OrganizacaoInfoLists from '@/components/listasPagsId/OrganizacaoInfoLists.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Organizacao',
    components:{
        OrganizacaoInfo,
        OrganizacaoInfoLists,
        ErrorModal
    },
    data(){
        return{
            profile: { associados: []},
            msg: "",
            isErrorVisible: false
        }
    },
    created(){
        axios.get(`http://localhost:3000/api/organizacoes/${this.$route.params.id}`)
            .then((response) => {
                this.profile = response.data;
            })
            .catch(error => {
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                }
            });
    },
    computed:{
        possivelAssociar: function() {
            var existe = false;

            this.profile.associados.forEach(element => {
                if(element.id == this.$store.getters.getUser.info.id && element.tipo == this.$store.getters.getUser.info.tipo){
                    existe = true;
                }
            });

            return (this.profile.organizacao &&
                this.profile.organizacao.tipo != "Partido" &&
                (this.$store.getters.getUser.info.tipo == "Politico" || this.$store.getters.getUser.info.tipo == "Empresario" || this.$store.getters.getUser.info.tipo == "CidadaoCreditado") &&
                !existe);
        },
        possivelDesassociar: function() {
            var existe = false;

            this.profile.associados.forEach(element => {
                if(element.id == this.$store.getters.getUser.info.id && element.tipo == this.$store.getters.getUser.info.tipo){
                    existe = true;
                }
            });

            return (this.profile.organizacao &&
                this.profile.organizacao.tipo != "Partido" &&
                (this.$store.getters.getUser.info.tipo == "Politico" || this.$store.getters.getUser.info.tipo == "Empresario" || this.$store.getters.getUser.info.tipo == "CidadaoCreditado") &&
                existe);
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
        toggleAssociar(){
            axios({
                method: 'post',
                url: `http://localhost:3000/api/organizacoes/${this.profile.organizacao.id}/associar`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                }
            })
            .then((response) => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                
                axios.get(`http://localhost:3000/api/organizacoes/${this.$route.params.id}`)
                .then((response) => {
                    this.showError("Operação bem sucedida.");
                    this.profile = response.data;
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
        }
    }
}
</script>

<style scoped>

</style>