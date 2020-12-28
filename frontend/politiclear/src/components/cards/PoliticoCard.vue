<template>
    <div>
        <router-link :to="{path: '/politicos/' + this.info.id}" tag="div">
            <h4>Nome: {{ this.info.nome }}</h4>
            <h4>CC: {{ this.info.nCC }}</h4>
            <h4>Partido: {{ this.info.partido }}</h4>
            <h4>Círculo eleitoral: {{ this.info.circuloEleitoral }}</h4>
        </router-link>
        <router-view/>
    </div>
</template>

<script>
export default {
    name: 'PoliticoCard',
    props: {
        info: {
            type: Object,
            required: true
        }
    }
}
</script>

<style scoped>
div {
    border: 1px solid black;
}
</style>