<template>
    <div>
        <h3>Este {{ this.msg }} será apagado permanentemente. Tem a certeza que pretende continuar? </h3>
        <button @click="sim">Sim</button>
        <button @click="nao">Não</button>
    </div>
</template>

<script>
export default {
    name: 'DeleteModal',
    props: {
        msg: {
            type: String,
            required: true
        }
    },
    methods: {
        sim(){
            this.$emit('sim');
        },
        nao(){
            this.$emit('nao');
        }
    }
}
</script>