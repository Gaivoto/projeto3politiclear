<template>
    <div class="viewWrapper">
        <PoliticosSearch class="searchbar" v-bind:partidos="this.partidos" v-on:pesquisar="updateList"/>
        <ElementList class="lista" tipo="PoliticoCard" v-bind:lista="this.lista"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import ElementList from '@/components/ElementList.vue'
import PoliticosSearch from '@/components/searchbars/PoliticosSearch.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Politicos',
    components: {
        ElementList,
        PoliticosSearch,
        ErrorModal
    },
    data(){
        return {
            lista: [],
            partidos: [],
            msg: "",
            isErrorVisible: false
        }
    },
    created(){
        axios.get("http://localhost:3000/api/politicos")
            .then(async (response) => {
                response.data.forEach(element => {
                    this.lista.push(element);
                });

                await axios.get("http://localhost:3000/api/organizacoes?tipo=Partido")
                    .then((response) => {
                        response.data.forEach(element => {
                            this.partidos.push(element);
                        });
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
            });
    },
    methods: {
        updateList(pesquisa){
            this.lista = [];

            var url = "http://localhost:3000/api/politicos";

            if(pesquisa.textoPesquisa != ""){
                url += `?search=${pesquisa.textoPesquisa}`;
            }

            if(pesquisa.partPesquisa != ""){
                if(url.includes("?")){
                    url += `&partido=${pesquisa.partPesquisa}`;
                } else {
                    url += `?partido=${pesquisa.partPesquisa}`;
                }
            }

            if(pesquisa.circPesquisa != ""){
                if(url.includes("?")){
                    url += `&circuloEleitoral=${pesquisa.circPesquisa}`;
                } else {
                    url += `?circuloEleitoral=${pesquisa.circPesquisa}`;
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