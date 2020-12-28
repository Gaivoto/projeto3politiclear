<template>
    <div>
        <CidadaoCreditadoInfo v-bind:info="this.profile"/>
        <CidadaoCreditadoInfoLists v-bind:info="this.profile"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import CidadaoCreditadoInfo from '@/components/info/CidadaoCreditadoInfo.vue'
import CidadaoCreditadoInfoLists from '@/components/listasPagsId/CidadaoCreditadoInfoLists.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'CidadaoCreditado',
    components:{
        CidadaoCreditadoInfo,
        CidadaoCreditadoInfoLists,
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
        axios.get(`http://localhost:3000/api/cidadaosCreditados/${this.$route.params.id}`)
            .then((response) => {
                this.profile = response.data;
            })
            .catch(error =>{
                if(error.response.data.details){
                    this.showError(error.response.data.details[0].message);
                } else {
                    this.showError(error.response.data);
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
        }
    }
}
</script>

<style scoped>

</style>