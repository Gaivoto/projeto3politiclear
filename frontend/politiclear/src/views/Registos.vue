<template>
    <div>
        <RegistosSearch v-on:pesquisar="updateList"/>
        <ElementList tipo="RegistoCard" v-bind:lista="this.lista"/>
        <router-link v-if="possivelCriar" tag="button" to="/registos/create">Criar novo registo</router-link>
        <router-view></router-view>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import ElementList from '@/components/ElementList.vue'
import RegistosSearch from '@/components/searchbars/RegistosSearch.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Registos',
    components: {
        ElementList,
        RegistosSearch,
        ErrorModal
    },
    data(){
        return {
            lista: [],
            msg: "",
            isErrorVisible: false
        }
    },
    created(){
        axios.get("http://localhost:3000/api/registos")
            .then(async (response) => {
                response.data.forEach(element => {
                    this.lista.push(element);
                });
            })
            .catch(error => this.showError(error));
    },
    computed: {
        possivelCriar: function(){
            return (this.$store.getters.getUser.info.tipo == "CidadaoCreditado");
        }
    },
    methods: {
        updateList(pesquisa){
            this.lista = [];

            var url = "http://localhost:3000/api/registos";

            if(pesquisa.textoPesquisa != ""){
                url += `?search=${pesquisa.textoPesquisa}`;
            }

            if(pesquisa.dataPesquisa != ""){
                if(url.includes("?")){
                    url += `&data=${pesquisa.dataPesquisa}`;
                } else {
                    url += `?data=${pesquisa.dataPesquisa}`;
                }
            }

            if(pesquisa.ordemPesquisa != ""){
                if(url.includes("?")){
                    url += `&ordem=${pesquisa.ordemPesquisa}`;
                } else {
                    url += `?ordem=${pesquisa.ordemPesquisa}`;
                }
            }

            axios.get(url)
                .then((response) => {
                    response.data.forEach(element => {
                        this.lista.push(element);
                    });
                })
                .catch(error => this.showError(error));
        },
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