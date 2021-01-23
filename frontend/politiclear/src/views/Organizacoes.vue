<template>
    <div class="viewWrapper">
        <OrganizacoesSearch class="searchbar" v-on:pesquisar="updateList"/>
        <ElementList class="lista" tipo="OrganizacaoCard" v-bind:lista="this.lista"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import ElementList from '@/components/ElementList.vue'
import OrganizacoesSearch from '@/components/searchbars/OrganizacoesSearch.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Organizacoes',
    components: {
        ElementList,
        OrganizacoesSearch,
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
        axios.get("http://localhost:3000/api/organizacoes")
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
    methods: {
        updateList(pesquisa){
            this.lista = [];

            var url = "http://localhost:3000/api/organizacoes";

            if(pesquisa.textoPesquisa != ""){
                url += `?search=${pesquisa.textoPesquisa}`;
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