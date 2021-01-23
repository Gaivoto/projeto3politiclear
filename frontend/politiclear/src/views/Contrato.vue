<template>
    <div class="element viewWrapper">
        <ContratoInfo class="info" v-bind:info="this.info"/>
        <button @click="node" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Ver rede de contactos</button>
        <router-link tag="button" v-if="possivelAlterar" @mousedown.native="startBtnClick" @mouseup.native="finishBtnClick" @mouseleave.native="finishBtnClick" :to="{path: '/contratos/'+ this.$route.params.id + '/edit'}">Alterar este contrato</router-link>
        <router-view></router-view>
        <button v-if="possivelEliminar" @click="toggleDeleteModal" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Eliminar este contrato</button>
        <ContratoInfoLists class="listaInfo" v-bind:info="this.info"/>
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
        node(){
            this.$store.commit('setNode', {tipo: "Contrato", id: this.info.contrato.id});
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
                if(error.response.status == "403"){
                    this.$store.commit('setUser', {info: {tipo: ""}, tokens: {}});
                }
            })
        },
        toggleDeleteModal(){
            this.isDeleteVisible = !this.isDeleteVisible;
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
    button {
        margin: 0px 10px 0px 10px;
    }
</style>