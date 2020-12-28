<template>
    <div>
        <h3>{{ this.msg }}</h3>
        <button @click="close">Fechar</button>
    </div>
</template>

<script>
export default {
    name: 'ErrorModal',
    props: {
        msg: {
            type: String,
            required: true
        }
    },
    methods: {
        close(){
            this.$emit('fechar');
        }
    }
}
</script>

<style scoped>
    div {
        border: 2px solid black;
    }
</style>