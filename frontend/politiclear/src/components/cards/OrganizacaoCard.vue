<template>
    <div>
        <router-link :to="{path: '/organizacoes/' + this.info.id}" tag="div">
            <h4><b>Nome:</b> {{ this.info.nome }}</h4>
            <h4><b>Descrição:</b> {{ this.info.descricao }}</h4>
            <h4><b>NIPC:</b> {{ this.info.nipc }}</h4>
        </router-link>
        <router-view/>
        <button v-if="possivelAlterar" @click="alterar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Alterar esta organização</button>
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