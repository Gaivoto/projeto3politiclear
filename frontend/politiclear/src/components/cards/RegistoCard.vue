<template>
    <div>
        <router-link :to="{path: '/registos/' + this.info.id}" tag="div">
            <h4><b>Título:</b> {{ this.info.titulo }}</h4>
            <h4><b>Autor:</b> {{ this.info.autor }}</h4>
            <h4><b>Data de criação:</b> {{ this.info.data.day.low + "/" + this.info.data.month.low + "/" + this.info.data.year.low }}</h4>
            <h4><b>Credibilidade:</b> {{ this.info.credibilidade }}</h4>
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
</style>