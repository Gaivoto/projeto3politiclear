<template>
    <div>
        <router-link :to="{path: '/concursos/' + this.info.id}" tag="div">
            <h4>Nome: {{ this.info.nome }}</h4>
            <h4>Tipo: {{ this.info.tipo }}</h4>
            <h4>Data de início: {{ this.info.dataInicio.day.low + "/" + this.info.dataInicio.month.low + "/" + this.info.dataInicio.year.low }}</h4>
            <h4>Data de fim: {{ this.info.dataFim.day.low + "/" + this.info.dataFim.month.low + "/" + this.info.dataFim.year.low }}</h4>
            <h4>Descrição: {{ this.info.descricao }}</h4>
        </router-link>
        <router-view/>
    </div>
</template>

<script>
export default {
    name: 'ConcursoCard',
    props: {
        info: {
            type: Object,
            required: true
        }
    }
}
</script>

<style scoped>
div {
    border: 1px solid black;
}
</style>