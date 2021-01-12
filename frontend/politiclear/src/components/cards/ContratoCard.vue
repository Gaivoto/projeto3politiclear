<template>
    <div>
        <router-link :to="{path: '/contratos/' + this.info.id}" tag="div">
            <h4><b>Nome:</b> {{ this.info.nome }}</h4>
            <h4><b>Tipo:</b> {{ this.info.tipo }}</h4>
            <h4><b>Data de início:</b> {{ this.info.dataInicio.day.low + "/" + this.info.dataInicio.month.low + "/" + this.info.dataInicio.year.low }}</h4>
            <h4><b>Data de fim:</b> {{ this.info.dataFim.day.low + "/" + this.info.dataFim.month.low + "/" + this.info.dataFim.year.low }}</h4>
            <h4><b>Descrição:</b> {{ this.info.descricao }}</h4>
            <h4><b>Conclusão:</b> {{ this.info.conclusao }}</h4>
        </router-link>
        <router-view/>
    </div>
</template>

<script>
export default {
    name: 'ContratoCard',
    props: {
        info: {
            type: Object,
            required: true
        }
    }
}
</script>

<style scoped>
</style>