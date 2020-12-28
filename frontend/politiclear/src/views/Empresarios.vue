<template>
    <div>
        <EmpresariosSearch v-bind:organizacoes="this.organizacoes" v-on:pesquisar="updateList"/>
        <ElementList tipo="EmpresarioCard" v-bind:lista="this.lista"/>
        <ErrorModal v-show="isErrorVisible" v-bind:msg="this.msg" v-on:fechar="hideError"/>
    </div>
</template>

<script>
import axios from 'axios'
import ElementList from '@/components/ElementList.vue'
import EmpresariosSearch from '@/components/searchbars/EmpresariosSearch.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

export default {
    name: 'Empresarios',
    components: {
        ElementList,
        EmpresariosSearch,
        ErrorModal
    },
    data(){
        return {
            lista: [],
            organizacoes: [],
            msg: "",
            isErrorVisible: false
        }
    },
    created(){
        axios.get("http://localhost:3000/api/empresarios")
            .then(async (response) => {
                response.data.forEach(element => {
                    this.lista.push(element);
                });

                await axios.get("http://localhost:3000/api/organizacoes")
                    .then((response) => {
                        response.data.forEach(element => {
                            this.organizacoes.push(element);
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

            var url = "http://localhost:3000/api/empresarios";

            if(pesquisa.textoPesquisa != ""){
                url += `?search=${pesquisa.textoPesquisa}`;
            }

            if(pesquisa.orgPesquisa != ""){
                if(url.includes("?")){
                    url += `&organizacao=${pesquisa.orgPesquisa}`;
                } else {
                    url += `?organizacao=${pesquisa.orgPesquisa}`;
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