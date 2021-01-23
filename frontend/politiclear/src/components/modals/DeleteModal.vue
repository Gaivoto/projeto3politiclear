<template>
    <div id="wrapper">
        <div id="innerDiv">
            <h3>Este {{ this.msg }} será apagado permanentemente. Tem a certeza que pretende continuar? </h3>
            <button @click="sim" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Sim</button>
            <button @click="nao" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Não</button>
        </div>
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
        height: 160px;
        padding: 50px;
        margin: auto;
        margin-top: 10%;
        border-radius: 10px;
    }

    #innerDiv > button {
        margin: 30px 15px 10px 15px;
        width: 100px;
    }
</style>