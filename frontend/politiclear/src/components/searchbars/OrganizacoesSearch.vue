<template>
    <div>
        <input type="text" id="nome" v-model="texto" autocomplete="off">
        <button id="pesquisar" v-on:click="pesquisar">Pesquisar</button>
    </div>
</template>

<script>
export default {
    name: 'OrganizacoesSearch',
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
        }
    }
}
</script>