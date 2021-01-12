<template>
    <div id="wrapperNovoVoto">
        <button @click="votar(1)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick" v-bind:class="{ votadoP: votadoPos }">Concordo</button>
        <button @click="votar(-1)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick" v-bind:class="{ votadoN: votadoNeg }">Discordo</button>
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
        },
        startBtnClick(e){
            if(e.button == 0){
                e.srcElement.classList.add("clicked");
            }
            
        },
        finishBtnClick(e){
            if(e.button == 0){
                e.srcElement.classList.remove("clicked");  
            }
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
    .votadoP{
        background-color: green;
    }

    .votadoN{
        background-color: red;
    }

    #wrapperNovoVoto {
        margin: 10px;
    }

    button {
        margin: 0px 10px 0px 10px;
        width: 100px;
    }

    h3 {
        display: inline;
    }
</style>