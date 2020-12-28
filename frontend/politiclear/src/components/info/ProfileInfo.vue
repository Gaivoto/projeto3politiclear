<template>
    <div v-if="info">
        <h2>Nome: {{ info.nome + " (" + info.tipoUser + ")" }}</h2>
        <h3>Username: {{ info.username }}</h3>
        <h3 v-if="info.nCC">Cartão de cidadão: {{ info.nCC.low }}</h3>
    </div>
</template>

<script>
export default {
    name: 'ProfileInfo',
    props: {
        info: {
            type: Object
        }
    }
}
</script>