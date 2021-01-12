<template>
    <div class="searchbarWrapper">
        <label for="organizacao">Organização:</label>
        <select name="organizacao" id="organizacao" v-model="idOrg">
            <option value="">Todas</option>
            <option v-for="org in organizacoes" v-bind:key="org.id" v-bind:value="org.id">{{ org.nome }}</option>
        </select>
        <button id="pesquisar" v-on:click="pesquisar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Pesquisar</button>
        <input type="text" id="nome" v-model="texto" autocomplete="off">
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