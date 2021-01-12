<template>
    <div>
        <router-link :to="{path: '/empresarios/' + this.info.id}" tag="div">
            <h4><b>Nome:</b> {{ this.info.nome }}</h4>
            <h4><b>CC:</b> {{ this.info.nCC }}</h4>
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
</style>