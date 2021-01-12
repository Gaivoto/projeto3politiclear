<template>
    <div>
        <h4><b>Autor:</b> {{ this.info.tipoAutor + " - " + this.info.nomeAutor }}</h4>
        <h4><b>Data:</b> {{ this.info.data.day.low + "/" + this.info.data.month.low + "/" + this.info.data.year.low }}</h4>
        <h4><b>Descrição:</b> {{ this.info.descricao }}</h4>
        <button v-if="possivelApagar" @click="apagar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Apagar comentário</button>
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
    }
}
</script>

<style scoped>
</style>