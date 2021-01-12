<template>
    <div class="searchbarWrapper">
        <label for="partido">Partido:</label>
        <select name="partido" id="partido" v-model="idPartido">
            <option value="">Todos</option>
            <option v-for="par in partidos" v-bind:key="par.id" v-bind:value="par.id">{{ par.nome }}</option>
        </select>
        <label for="circulo">Circulo eleitoral:</label>
        <select name="circulo" id="circulo" v-model="circEleitoral">
            <option value="">Todos</option>
            <option value="Norte">Norte</option>
            <option value="Centro">Centro</option>
            <option value="Sul">Sul</option>
            <option value="Açores">Açores</option>
            <option value="Madeira">Madeira</option>
        </select>
        <button id="pesquisar" v-on:click="pesquisar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Pesquisar</button>
        <input type="text" id="nome" v-model="texto" autocomplete="off">
    </div>
</template>

<script>
export default {
    name: 'PoliticosSearch',
    props: {
        partidos: {
            type: Array,
            required: true
        }
    },
    data(){
        return {
            idPartido: "",
            circEleitoral: "",
            texto: ""
        }
    },
    methods: {
        pesquisar(){
            const pesquisa = {
                partPesquisa: this.idPartido,
                circPesquisa: this.circEleitoral,
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