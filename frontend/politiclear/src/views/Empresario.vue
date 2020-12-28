<template>
    <div>
        <EmpresarioInfo v-bind:info="this.profile"/>
        <EmpresarioInfoLists v-bind:info="this.profile"/>
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