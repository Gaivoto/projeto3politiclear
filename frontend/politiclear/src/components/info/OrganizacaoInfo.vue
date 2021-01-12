<template>
    <div v-if="info.organizacao">
        <h2><b>Nome:</b> {{ info.organizacao.nome }}</h2>
        <h3><b>NIPC:</b> {{ info.organizacao.nipc }}</h3>
        <h3><b>Tipo:</b> {{ info.organizacao.tipo }}</h3>
        <h3><b>Data de criação:</b> {{ info.organizacao.dataCriacao.day.low + "/" + info.organizacao.dataCriacao.month.low + "/" + info.organizacao.dataCriacao.year.low }}</h3>
        <h3><b>Descrição:</b> {{ info.organizacao.descricao }}</h3>
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