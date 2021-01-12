<template>
    <div id="wrapper" @click="close">
        <div id="innerDiv">
            <h3>Criar comentário</h3>
            <textarea name="comentario" cols="30" rows="10" v-model="comentario" placeholder="Comentário"></textarea>
            <button @click="comentar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Comentar</button>
            <button id="close" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Cancelar</button>
        </div>
    </div>
</template> 

<script>
export default {
    name: 'NovoComentarioInfo',
    data(){
        return {
            comentario: ""
        }
    },
    methods: {
        close(e){
            if(e.srcElement.id == "wrapper" || e.srcElement.id == "close"){
                this.$emit('fechar');
                
                this.comentario = "";    
            }
        },
        comentar(){
            this.$emit('comentar', this.comentario);
            this.comentario = "";
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
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        background: rgba(60, 60, 60, 0.8);
    }

    #innerDiv {
        background-color: white;
        width: 30%;
        height: 60%;
        padding: 50px;
        margin: auto;
        margin-top: 4%;
        border-radius: 10px;
    }

    #innerDiv textarea {
        width: 400px;
        height: 300px;
        margin: 6px 0px 6px 0px;
        border-radius: 5px;
        padding: 0px 10px 0px 10px;
    }

    #innerDiv h3 {
        font-size: 25px;
    }

    #innerDiv button {
        margin: 30px 8px 0px 8px;
    }
</style>