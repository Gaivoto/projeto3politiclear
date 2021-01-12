<template>
    <div class="searchbarWrapper">
        <label for="exclusividade">Exclusividade:</label>
        <select name="exclusividade" id="exclusividade" v-model="exclusividade">
            <option value="">Todos</option>
            <option value="privado">Privado</option>
            <option value="publico">Público</option>
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
    name: 'EventosSearch',
    data(){
        return {
            exclusividade: "",
            data: "",
            texto: ""
        }
    },
    methods: {
        pesquisar(){
            const pesquisa = {
                exclusividadePesquisa: this.exclusividade,
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