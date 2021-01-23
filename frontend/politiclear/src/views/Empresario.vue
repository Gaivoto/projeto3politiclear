<template>
    <div class="viewWrapper">
        <EmpresarioInfo class="info" v-bind:info="this.profile"/>
        <button @click="node" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Ver rede de contactos</button>
        <EmpresarioInfoLists class="listaInfo" v-bind:info="this.profile"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import EmpresarioInfo from '@/components/info/EmpresarioInfo.vue'
import EmpresarioInfoLists from '@/components/listasPagsId/EmpresarioInfoLists.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Empresario',
    components:{
        EmpresarioInfo,
        EmpresarioInfoLists,
        ErrorModal
    },
    data(){
        return{
            profile: {},
            msg: "",
            isErrorVisible: false
        }
    },
    created(){
        axios.get(`http://localhost:3000/api/empresarios/${this.$route.params.id}`)
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
    methods: {
        node(){
            this.$store.commit('setNode', {tipo: "Empresario", id: this.profile.empresario.id});
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

</style>