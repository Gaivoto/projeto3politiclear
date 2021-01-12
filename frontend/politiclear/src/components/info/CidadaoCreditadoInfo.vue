<template>
    <div v-if="info.cidadaoCreditado">
        <h2><b>Nome:</b> {{ info.cidadaoCreditado.nome }}</h2>
        <h3><b>Cartão de cidadão:</b> {{ info.cidadaoCreditado.nCC }}</h3>
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