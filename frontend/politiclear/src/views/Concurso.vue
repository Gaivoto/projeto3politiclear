<template>
    <div class="viewWrapper">
        <ConcursoInfo class="info" v-bind:info="this.info"/>
        <button @click="node" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Ver rede de contactos</button>
        <router-link tag="button" @mousedown.native="startBtnClick" @mouseup.native="finishBtnClick" @mouseleave.native="finishBtnClick" v-if="possivelAlterar" :to="{path: '/concursos/'+ this.$route.params.id + '/edit'}">Alterar este concurso</router-link>
        <router-view></router-view>
        <button v-if="possivelEliminar" @click="toggleDeleteModal" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Eliminar este concurso</button>
        <ConcursoInfoLists class="listaInfo" v-bind:info="this.info"/>
        <DeleteModal v-show="isDeleteVisible" msg="concurso" v-on:sim="apagarConcurso" v-on:nao="toggleDeleteModal"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import ConcursoInfo from '@/components/info/ConcursoInfo.vue'
import ConcursoInfoLists from '@/components/listasPagsId/ConcursoInfoLists.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Concurso',
    components: {
        ConcursoInfo,
        ConcursoInfoLists,
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
        axios({
            method: "get",
            url: `http://localhost:3000/api/concursos/${this.$route.params.id}`
        })
            .then((response) => {
                this.info = response.data;
            })
            .catch(error => this.showError(error));
    },
    computed: {
        possivelAlterar: function(){
            var boolCriador = (this.info.criador && this.info.criador.id == this.$store.getters.getUser.info.id && this.info.criador.tipo == this.$store.getters.getUser.info.tipo);
            var boolData = (this.info.concurso && new Date() < new Date(`${this.info.concurso.dataFim.month.low}/${this.info.concurso.dataFim.day.low}/${this.info.concurso.dataFim.year.low}`));

            return (boolCriador && boolData);
        },
        possivelEliminar: function(){
            var boolCriador = (this.info.criador && this.info.criador.id == this.$store.getters.getUser.info.id && this.info.criador.tipo == this.$store.getters.getUser.info.tipo);
            var boolData = (this.info.concurso && new Date() < new Date(`${this.info.concurso.dataInicio.month.low}/${this.info.concurso.dataInicio.day.low}/${this.info.concurso.dataInicio.year.low}`));
            var boolAdm = this.$store.getters.getUser.info.tipo == "Administrador";

            return ((boolCriador && boolData) || boolAdm);
        }
    },
    methods: {
        node(){
            this.$store.commit('setNode', {tipo: "Concurso", id: this.info.concurso.id});
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
        apagarConcurso(){
            axios({
                method: 'delete',
                url: `http://localhost:3000/api/concursos/${this.info.concurso.id}`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                }
            })
            .then(response => {
                this.showError("Concurso eliminado com sucesso.");
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