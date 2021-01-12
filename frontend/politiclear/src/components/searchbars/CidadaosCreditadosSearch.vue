<template>
    <div class="searchbarWrapper">
        <button id="pesquisar" v-on:click="pesquisar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Pesquisar</button>
        <input type="text" id="nome" v-model="texto" autocomplete="off">
    </div>
</template>

<script>
export default {
    name: 'CidadaosCreditadosSearch',
    data(){
        return {
            texto: ""
        }
    },
    methods: {
        pesquisar(){
            const pesquisa = {
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