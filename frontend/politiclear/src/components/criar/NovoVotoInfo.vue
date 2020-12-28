<template>
    <div>
        <h3>Votar: </h3>
        <button @click="votar(1)" v-bind:class="{ votado: votadoPos }">+1</button>
        <button @click="votar(-1)" v-bind:class="{ votado: votadoNeg }">-1</button>
    </div>
</template>

<script>
export default {
    name: 'NovoVotoInfo',
    props: {
        votos: {
            type: Array
        }
    },
    methods: {
        votar(valor){
            this.$emit('votar', valor);
        }
    },
    computed: {
        votadoPos: function(){
            var votado = false;

            this.votos.forEach(element => {
                if(element.id == this.$store.getters.getUser.info.id && element.tipo == this.$store.getters.getUser.info.tipo && element.valor == 1){
                    votado = true;
                }
            });

            return votado;
        },
        votadoNeg: function(){
            var votado = false;

            this.votos.forEach(element => {
                if(element.id == this.$store.getters.getUser.info.id && element.tipo == this.$store.getters.getUser.info.tipo && element.valor == -1){
                    votado = true;
                }
            });

            return votado;
        }
    }
}
</script>

<style scoped>
    .votado{
        background-color: green;
    }
</style>