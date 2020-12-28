<template>
    <div>
        <ContratoInfo v-bind:info="this.info"/>
        <router-link tag="button" v-if="possivelAlterar" :to="{path: '/contratos/'+ this.$route.params.id + '/edit'}">Alterar este contrato</router-link>
        <router-view></router-view>
        <button v-if="possivelEliminar" @click="toggleDeleteModal">Eliminar este contrato</button>
        <ContratoInfoLists v-bind:info="this.info"/>
        <DeleteModal v-show="isDeleteVisible" msg="contrato" v-on:sim="apagarContrato" v-on:nao="toggleDeleteModal"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import ContratoInfo from '@/components/info/ContratoInfo.vue'
import ContratoInfoLists from '@/components/listasPagsId/ContratoInfoLists.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Contrato',
    components: {
        ContratoInfo,
        ContratoInfoLists,
        DeleteModal,
        ErrorModal
    },
    data(){
        return{
            info: {},
            msg: "",
            isDeleteVisible: false,
            isErrorVisible: false
        }
    },
    created(){
        axios.get(`http://localhost:3000/api/contratos/${this.$route.params.id}`)
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
        possivelAlterar: function(){
            var boolCriador = (this.info.criador && this.info.criador.id == this.$store.getters.getUser.info.id && this.info.criador.tipo == this.$store.getters.getUser.info.tipo);
            var boolData = (this.info.contrato && new Date() < new Date(`${this.info.contrato.dataFim.month.low}/${this.info.contrato.dataFim.day.low}/${this.info.contrato.dataFim.year.low}`));
            
            return (boolCriador && boolData);
        },
        possivelEliminar: function(){
            var boolCriador = (this.info.criador && this.info.criador.id == this.$store.getters.getUser.info.id && this.info.criador.tipo == this.$store.getters.getUser.info.tipo);
            var boolData = (this.info.contrato && new Date() < new Date(`${this.info.contrato.dataInicio.month.low}/${this.info.contrato.dataInicio.day.low}/${this.info.contrato.dataInicio.year.low}`));
            var boolAdm = this.$store.getters.getUser.info.tipo == "Administrador";

            return ((boolCriador && boolData) || boolAdm);
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
        apagarContrato(){
            axios({
                method: 'delete',
                url: `http://localhost:3000/api/contratos/${this.info.contrato.id}`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                }
            })
            .then(response => {
                this.showError("Contrato eliminado com sucesso.");
                this.toggleDeleteModal();
            })
            .catch(error => {
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
                };
            })
        },
        toggleDeleteModal(){
            this.isDeleteVisible = !this.isDeleteVisible;
        }
    }
}
</script>

<style scoped>

</style>