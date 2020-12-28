<template>
    <div v-if="info.contrato">
        <h2>Nome: {{ info.contrato.nome }}</h2>
        <router-link tag="h3" :to="{path: '/' + info.criador.tipo + 's/' + info.criador.id}">Criador: {{ info.criador.tipo + " - " + info.criador.nome }}</router-link>
        <router-view></router-view>
        <h3>Data de início: {{ info.contrato.dataInicio.day.low + "/" + info.contrato.dataInicio.month.low + "/" + info.contrato.dataInicio.year.low }}</h3>
        <h3>Data de fim: {{ info.contrato.dataFim.day.low + "/" + info.contrato.dataFim.month.low + "/" + info.contrato.dataFim.year.low }}</h3>
        <h3>Tipo: {{ info.contrato.tipo }}</h3>
        <h3>Descrição: {{ info.contrato.descricao }}</h3>
        <h3>Conclusão: {{ info.contrato.conclusao }}</h3>
    </div>
</template>

<script>
export default {
    name: 'ContratoInfo',
    props: {
        info: {
            type: Object,
            required: true
        }
    }
}
</script>