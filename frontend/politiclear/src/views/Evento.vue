<template>
    <div>
        <EventoInfo class="info" v-bind:info="this.info"/>
        <button @click="node" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Ver rede de contactos</button>
        <button v-if="possivelParticipar" @click="toggleParticipar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Participar neste evento</button>
        <button v-if="possivelSair" @click="toggleParticipar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Cancelar participação</button>
        <router-link tag="button" v-if="possivelAlterar" @mousedown.native="startBtnClick" @mouseup.native="finishBtnClick" @mouseleave.native="finishBtnClick" :to="{path: '/eventos/'+ this.$route.params.id + '/edit'}">Alterar este evento</router-link>
        <router-view></router-view>
        <button v-if="possivelEliminar" @click="toggleDeleteModal" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Eliminar este evento</button>
        <EventoInfoLists class="listaInfo" v-bind:participantes="this.info.participantes"/>
        <DeleteModal v-show="isDeleteVisible" msg="evento" v-on:sim="apagarEvento" v-on:nao="toggleDeleteModal"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import EventoInfo from '@/components/info/EventoInfo.vue'
import EventoInfoLists from '@/components/listasPagsId/EventoInfoLists.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Evento',
    components: {
        EventoInfo,
        EventoInfoLists,
        DeleteModal,
        ErrorModal
    },
    data(){
        return{
            info: { participantes: []},
            msg: "",
            isDeleteVisible: false,
            isErrorVisible: false
        }
    },
    created(){
        axios.get(`http://localhost:3000/api/eventos/${this.$route.params.id}`)
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
    computed:{
        possivelParticipar: function() {
            var existe = false;

            this.info.participantes.forEach(element => {
                if(element.id == this.$store.getters.getUser.info.id && element.tipo == this.$store.getters.getUser.info.tipo){
                    existe = true;
                }
            });

            return (this.info.evento &&
                this.info.evento.exclusividade == "Publico" &&
                new Date() < new Date(`${this.info.evento.dataFim.month.low}/${this.info.evento.dataFim.day.low}/${this.info.evento.dataFim.year.low}`) &&
                (this.$store.getters.getUser.info.tipo != "" && this.$store.getters.getUser.info.tipo != "Administrador") &&
                !existe);
        },
        possivelSair: function() {
            var existe = false;

            this.info.participantes.forEach(element => {
                if(element.id == this.$store.getters.getUser.info.id && element.tipo == this.$store.getters.getUser.info.tipo){
                    existe = true;
                }
            });

            return (this.info.evento &&
                this.info.evento.exclusividade == "Publico" &&
                new Date() < new Date(`${this.info.evento.dataFim.month.low}/${this.info.evento.dataFim.day.low}/${this.info.evento.dataFim.year.low}`) &&
                (this.$store.getters.getUser.info.tipo != "" && this.$store.getters.getUser.info.tipo != "Administrador") &&
                existe);
        },
        possivelAlterar: function(){
            var boolCriador = (this.info.criador && this.info.criador.id == this.$store.getters.getUser.info.id && this.info.criador.tipo == this.$store.getters.getUser.info.tipo);
            var boolData = (this.info.evento && new Date() < new Date(`${this.info.evento.dataFim.month.low}/${this.info.evento.dataFim.day.low}/${this.info.evento.dataFim.year.low}`));

            return (boolCriador && boolData);
        },
        possivelEliminar: function(){
            var boolCriador = (this.info.criador && this.info.criador.id == this.$store.getters.getUser.info.id && this.info.criador.tipo == this.$store.getters.getUser.info.tipo);
            var boolData = (this.info.evento && new Date() < new Date(`${this.info.evento.dataInicio.month.low}/${this.info.evento.dataInicio.day.low}/${this.info.evento.dataInicio.year.low}`));
            var boolAdm = this.$store.getters.getUser.info.tipo == "Administrador";

            return ((boolCriador && boolData) || boolAdm);
        }
    },
    methods: {
        node(){
            this.$store.commit('setNode', {tipo: "Evento", id: this.info.evento.id});
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
        toggleParticipar(){
            axios({
                method: 'post',
                url: `http://localhost:3000/api/eventos/${this.info.evento.id}/participar`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                }
            })
            .then((response) => {
                if(response.data.token){
                    this.$store.commit('setToken', response.data.token);
                }
                
                axios.get(`http://localhost:3000/api/eventos/${this.$route.params.id}`)
                .then((response) => {
                    this.showError("Operação bem sucedida.");
                    this.info = response.data;
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
                if(error.response.status == "403"){
                    this.$store.commit('setUser', {info: {tipo: ""}, tokens: {}});
                }
            });
        },
        apagarEvento(){
            axios({
                method: 'delete',
                url: `http://localhost:3000/api/eventos/${this.info.evento.id}`,
                headers: {
                    Authorization: `Bearer ${this.$store.getters.getUser.tokens.accessToken}`,
                    refreshToken: this.$store.getters.getUser.tokens.refreshToken
                }
            })
            .then(response => {
                this.showError("Evento eliminado com sucesso.");
                this.toggleDeleteModal();
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