<template>
    <div>
        <router-link :to="{path: '/registos/' + this.info.id}" tag="div">
            <h4>Título: {{ this.info.titulo }}</h4>
            <h4>Autor: {{ this.info.autor }}</h4>
            <h4>Data de criação: {{ this.info.data.day.low + "/" + this.info.data.month.low + "/" + this.info.data.year.low }}</h4>
            <h4>Credibilidade: {{ this.info.credibilidade }}</h4>
        </router-link>
        <router-view/>
    </div>
</template>

<script>
export default {
    name: 'RegistoCard',
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