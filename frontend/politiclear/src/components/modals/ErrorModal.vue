<template>
    <div @click="close" id="wrapper">
        <div id="innerDiv">
            <h3>{{ this.msg }}</h3>
            <button id="close" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Fechar</button>
        </div>
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
        close(e){
            if(e.srcElement.id == "wrapper" || e.srcElement.id == "close"){
                if(this.$router.history.current.path != "/" && this.msg == "A sua sessão expirou. Faça login novamente."){
                    this.$router.push("/");  
                } else if(this.msg == "Concurso eliminado com sucesso." || this.msg == "Concurso alterado com sucesso." || this.msg == "Concurso criado com sucesso."){
                    this.$router.push("/concursos");
                } else if(this.msg == "Evento eliminado com sucesso." || this.msg == "Evento alterado com sucesso." || this.msg == "Evento criado com sucesso."){
                    this.$router.push("/eventos");
                } else if(this.msg == "Contrato eliminado com sucesso." || this.msg == "Contrato alterado com sucesso." || this.msg == "Contrato criado com sucesso."){
                    this.$router.push("/contratos");
                }
                this.$emit('fechar');
            }
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
    #wrapper {
        position: fixed;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        background: rgba(60, 60, 60, 0.8);
    }

    #innerDiv {
        background-color: white;
        width: 380px;
        height: 150px;
        padding: 50px;
        margin: auto;
        margin-top: 10%;
        border-radius: 10px;
    }

    #innerDiv button {
        margin-top: 25px;
    }
</style>