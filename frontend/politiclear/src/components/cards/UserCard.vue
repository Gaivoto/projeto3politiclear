<template>
    <div>
        <router-link :to="{path: '/' + this.path}" tag="div">
            <h4><b>Tipo de utilizador:</b> {{ this.info.tipoUser }}</h4>
            <h4><b>Nome:</b> {{ this.info.user.nome }}</h4>
            <h4><b>CC:</b> {{ this.info.user.nCC }}</h4>
            <h4><b>Estado:</b> {{ this.estado }}</h4>
            <h4 v-if="this.info.tipoUser == 'Politico'"><b>Partido:</b> {{ this.info.user.partido }}</h4>
            <h4 v-if="this.info.tipoUser == 'Politico'"><b>Círculo eleitoral:</b> {{ this.info.user.circuloEleitoral }}</h4>
        </router-link>
        <router-view/>
        <button v-if="possivelAlterar" @click="alterar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Alterar este utilizador</button>
        <button v-if="possivelAtivar" @click="desativar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Ativar este utilizador</button>
        <button v-if="possivelDesativar" @click="desativar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Desativar este utilizador</button>
    </div>
</template>

<script>
export default {
    name: 'UserCard',
    props: {
        info: {
            type: Object,
            required: true
        }
    },
    computed: {
        possivelAlterar: function(){
            return (this.$store.getters.getUser.info.tipo == "Administrador");
        },
        possivelAtivar: function(){
            return (this.$store.getters.getUser.info.tipo == "Administrador" && !this.info.user.ativo);
        },
        possivelDesativar: function(){
            return (this.$store.getters.getUser.info.tipo == "Administrador" && this.info.user.ativo);
        },
        path: function(){
            switch(this.info.tipoUser){
                case "CidadaoRegistado":
                    return `cidadaosRegistados/${this.info.user.id}`;
                case "CidadaoCreditado":
                    return `cidadaosCreditados/${this.info.user.id}`;
                case "Administrador":
                    return "areaAdm/users";
                default:
                    return `${this.info.tipoUser}s/${this.info.user.id}`;
            }
        },
        estado: function(){
            if(this.info.user.ativo){
                return "Ativo";
            }

            return "Desativo";
        }
    },
    methods: {
        alterar(){
            const info = {
                id: this.info.user.id,
                tipo: this.info.tipoUser
            }

            this.$emit('alterar-user', info);
        },
        desativar(){
            const info = {
                id: this.info.user.id,
                tipo: this.info.tipoUser
            }

            this.$emit('desativar-user', info);
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