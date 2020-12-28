<template>
    <div v-if="info.cidadaoCreditado">
        <h2>Nome: {{ info.cidadaoCreditado.nome }}</h2>
        <h3>Cartão de cidadão: {{ info.cidadaoCreditado.nCC }}</h3>
    </div>
</template>

<script>
export default {
    name: 'CidadaoCreditadoInfo',
    props: {
        info :{
            type: Object,
            required: true
        }
    }
}
</script>