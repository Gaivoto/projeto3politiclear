<template>
    <div>
        <h4>Autor: {{ this.info.tipoAutor + " - " + this.info.nomeAutor }}</h4>
        <h4>Data: {{ this.info.data.day.low + "/" + this.info.data.month.low + "/" + this.info.data.year.low }}</h4>
        <h4>Descrição: {{ this.info.descricao }}</h4>
        <button v-if="possivelApagar" @click="apagar">Apagar comentário</button>
    </div>
</template>

<script>
export default {
    name: 'ComentarioCard',
    props: {
        info: {
            type: Object,
            required: true
        }
    },
    computed: {
        possivelApagar: function(){
            return (this.$store.getters.getUser.info.tipo == "Administrador");
        }
    },
    methods: {
        apagar(){
            this.$emit('apagar', this.info.id);
        }
    }
}
</script>

<style scoped>
div {
    border: 1px solid black;
}
</style>