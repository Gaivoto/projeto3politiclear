<template>
    <div>
        <label for="tipo">Tipo:</label>
        <select name="tipo" id="tipo" v-model="tipo">
            <option value="">Todos</option>
            <option value="construcao">Construção</option>
            <option value="outro">Outro</option>
        </select>
        <label for="data">Data:</label>
        <select name="data" id="data" v-model="data">
            <option value="dia">Hoje</option>
            <option value="mes">Este mês</option>
            <option value="ano">Este ano</option>
            <option value="antigoRecente">Mais antigo para o mais recente</option>
            <option value="recenteAntigo">Mais recente para o mais antigo</option>
        </select>
        <input type="text" id="nome" v-model="texto" autocomplete="off">
        <button id="pesquisar" v-on:click="pesquisar">Pesquisar</button>
    </div>
</template>

<script>
export default {
    name: 'ContratosSearch',
    data(){
        return {
            tipo: "",
            data: "",
            texto: ""
        }
    },
    methods: {
        pesquisar(){
            const pesquisa = {
                tipoPesquisa: this.tipo,
                dataPesquisa: this.data,
                textoPesquisa: this.texto
            }

            this.$emit('pesquisar', pesquisa); 
        }
    }
}
</script>