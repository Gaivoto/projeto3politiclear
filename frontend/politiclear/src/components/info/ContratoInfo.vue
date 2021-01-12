<template>
    <div v-if="info.contrato">
        <h2><b>Nome:</b> {{ info.contrato.nome }}</h2>
        <router-link tag="h3" :to="{path: '/' + info.criador.tipo + 's/' + info.criador.id}"><b>Criador</b>: {{ info.criador.tipo + " - " + info.criador.nome }}</router-link>
        <router-view></router-view>
        <h3><b>Data de início:</b> {{ info.contrato.dataInicio.day.low + "/" + info.contrato.dataInicio.month.low + "/" + info.contrato.dataInicio.year.low }}</h3>
        <h3><b>Data de fim:</b> {{ info.contrato.dataFim.day.low + "/" + info.contrato.dataFim.month.low + "/" + info.contrato.dataFim.year.low }}</h3>
        <h3><b>Tipo:</b> {{ info.contrato.tipo }}</h3>
        <h3><b>Descrição:</b> {{ info.contrato.descricao }}</h3>
        <h3><b>Conclusão:</b> {{ info.contrato.conclusao }}</h3>
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