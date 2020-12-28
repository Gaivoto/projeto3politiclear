<template>
    <div v-if="info.organizacao">
        <h2>Nome: {{ info.organizacao.nome }}</h2>
        <h3>NIPC: {{ info.organizacao.nipc }}</h3>
        <h3>Tipo: {{ info.organizacao.tipo }}</h3>
        <h3>Data de criação: {{ info.organizacao.dataCriacao.day.low + "/" + info.organizacao.dataCriacao.month.low + "/" + info.organizacao.dataCriacao.year.low }}</h3>
        <h3>Descrição: {{ info.organizacao.descricao }}</h3>
    </div>
</template>

<script>
export default {
    name: 'OrganizacaoInfo',
    props: {
        info: {
            type: Object,
            required: true
        }
    }
}
</script>