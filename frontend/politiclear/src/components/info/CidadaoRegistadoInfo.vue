<template>
    <div v-if="info.cidadaoRegistado">
        <h2>Nome: {{ info.cidadaoRegistado.nome }}</h2>
        <h3>Cartão de cidadão: {{ info.cidadaoRegistado.nCC }}</h3>
    </div>
</template>

<script>
export default {
    name: 'CidadaoRegistadoInfo',
    props: {
        info :{
            type: Object,
            required: true
        }
    }
}
</script>