<template>
    <div>
        <label for="organizacao">Organização:</label>
        <select name="organizacao" id="organizacao" v-model="idOrg">
            <option value="">Todas</option>
            <option v-for="org in organizacoes" v-bind:key="org.id" v-bind:value="org.id">{{ org.nome }}</option>
        </select>
        <input type="text" id="nome" v-model="texto" autocomplete="off">
        <button id="pesquisar" v-on:click="pesquisar">Pesquisar</button>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'EmpresariosSearch',
    props:{
        organizacoes: {
            type: Array,
            required: true
        }
    },
    data(){
        return {
            idOrg: "",
            texto: ""    
        }
    },
    methods: {
        pesquisar(){
            const pesquisa = {
                orgPesquisa: this.idOrg,
                textoPesquisa: this.texto
            }

            this.$emit('pesquisar', pesquisa); 
        }
    }
}
</script>