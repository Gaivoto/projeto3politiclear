<template>
    <div>
        <router-link :to="{path: '/organizacoes/' + this.info.id}" tag="div">
            <h4>Nome: {{ this.info.nome }}</h4>
            <h4>escrição: {{ this.info.descricao }}</h4>
            <h4>NIPC: {{ this.info.nipc }}</h4>
        </router-link>
        <router-view/>
        <button v-if="possivelAlterar" @click="alterar">Alterar esta organização</button>
    </div>
</template>

<script>
export default {
    name: 'OrganizacaoCard',
    props: {
        info: {
            type: Object,
            required: true
        }
    },
    computed: {
        possivelAlterar: function(){
            return (this.$store.getters.getUser.info.tipo == "Administrador");
        }
    },
    methods: {
        alterar(){
            this.$emit('alterar-org', this.info.id);
        }
    }
}
</script>

<style scoped>
div {
    border: 1px solid black;
}
</style>