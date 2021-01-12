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
        width: 25%;
        height: 20%;
        padding: 50px;
        margin: auto;
        margin-top: 10%;
        border-radius: 10px;
    }

    #innerDiv button {
        margin-top: 25px;
    }
</style>