<template>
    <div v-if="info.cidadaoRegistado">
        <h2><b>Nome:</b> {{ info.cidadaoRegistado.nome }}</h2>
        <h3><b>Cartão de cidadão:</b> {{ info.cidadaoRegistado.nCC }}</h3>
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