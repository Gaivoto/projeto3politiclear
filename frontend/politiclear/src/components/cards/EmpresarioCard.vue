<template>
    <div>
        <router-link :to="{path: '/empresarios/' + this.info.id}" tag="div">
            <h4>Nome: {{ this.info.nome }}</h4>
            <h4>CC: {{ this.info.nCC }}</h4>
        </router-link>
        <router-view/>
    </div>
</template>

<script>
export default {
    name: 'EmpresarioCard',
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