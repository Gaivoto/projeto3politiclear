<template>
    <div class="searchbarWrapper">
        <label for="ordem">Ordenar por:</label>
        <select name="ordem" id="ordem" v-model="ordem">
            <option value="comentariosCres">Ordem crescente de comentários</option>
            <option value="comentariosDecres">Ordem descrescente de comentários</option>
            <option value="votosCres">Ordem crescente de credibilidade</option>
            <option value="votosDecres">Ordem descrescente de credibilidade</option>
        </select>
        <label for="data">Data:</label>
        <select name="data" id="data" v-model="data">
            <option value="dia">Hoje</option>
            <option value="mes">Este mês</option>
            <option value="ano">Este ano</option>
            <option value="antigoRecente">Mais antigo para o mais recente</option>
            <option value="recenteAntigo">Mais recente para o mais antigo</option>
        </select>
        <button id="pesquisar" v-on:click="pesquisar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Pesquisar</button>
        <input type="text" id="nome" v-model="texto" autocomplete="off">
    </div>
</template>

<script>
export default {
    name: 'RegistosSearch',
    data(){
        return {
            ordem: "",
            data: "",
            texto: ""
        }
    },
    methods: {
        pesquisar(){
            const pesquisa = {
                ordemPesquisa: this.ordem,
                dataPesquisa: this.data,
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