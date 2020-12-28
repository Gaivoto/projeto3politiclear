<template>
    <div>
        <ConcursosSearch v-on:pesquisar="updateList"/>
        <ElementList tipo="ConcursoCard" v-bind:lista="this.lista"/>
        <router-link v-if="possivelCriar" tag="button" to="/concursos/create">Criar novo concurso</router-link>
        <router-view></router-view>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import ElementList from '@/components/ElementList.vue'
import ConcursosSearch from '@/components/searchbars/ConcursosSearch.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Concursos',
    components: {
        ElementList,
        ConcursosSearch,
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
        axios.get("http://localhost:3000/api/concursos")
            .then(async (response) => {
                response.data.forEach(element => {
                    this.lista.push(element);
                });
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
        possivelCriar: function(){
            return (this.$store.getters.getUser.info.tipo == "Empresario" || this.$store.getters.getUser.info.tipo == "Politico");
        }
    },
    methods: {
        updateList(pesquisa){
            this.lista = [];

            var url = "http://localhost:3000/api/concursos";

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

            if(pesquisa.tipoPesquisa != ""){
                if(url.includes("?")){
                    url += `&tipo=${pesquisa.tipoPesquisa}`;
                } else {
                    url += `?tipo=${pesquisa.tipoPesquisa}`;
                }
            }

            axios.get(url)
                .then((response) => {
                    response.data.forEach(element => {
                        this.lista.push(element);
                    });
                })
                .catch(error => {
                    if(error.response.data.details){
                        this.showError(error.response.data.details[0].message);
                    } else {
                        this.showError(error.response.data);
                    }
                });
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