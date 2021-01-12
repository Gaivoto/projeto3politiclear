<template>
    <div v-if="info">
        <h2><b>Nome:</b> {{ info.nome + " (" + info.tipoUser + ")" }}</h2>
        <h3><b>Username:</b> {{ info.username }}</h3>
        <h3 v-if="info.nCC"><b>Cartão de cidadão:</b> {{ info.nCC }}</h3>
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