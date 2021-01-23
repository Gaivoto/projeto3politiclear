<template>
    <div id="wrapper" @click="cancelar">
        <div id="innerDiv">
            <h3>Deixe em branco os campos que não pretende alterar.</h3>
            <h4>Nome atual: {{ this.info.nome }}</h4>
            <h4>Username atual: {{ this.info.username }}</h4>
            <h4>Cartão de cidadão atual: {{ this.info.nCC }}</h4>
            <label for="nome">Novo nome: </label>
            <input type="text" name="nome" v-model="nome" autocomplete="off"><br>
            <label for="username">Novo username: </label>
            <input type="text" name="username" v-model="username" autocomplete="off"><br>
            <label for="password">Nova password: </label>
            <input type="password" name="password" v-model="password" autocomplete="off"><br>
            <label for="confpassword">Confirmar password: </label>
            <input type="password" name="confpassword" v-model="confPassword" autocomplete="off"><br>
            <label for="nCC">Novo cartão de cidadão: </label>
            <input type="number" min="1" max="99999999" name="nCC" v-model="nCC" autocomplete="off"><br>
            <button @click="alterar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick" id="btnAlterar">Confirmar</button>
            <button id="close" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Cancelar</button>
        </div>    
    </div>
</template>

<script>
export default {
    name: 'AlterarPerfilModal',
    props: {
        info: {
            type: Object,
            required: true
        }
    },
    data(){
        return {
            nome: "",
            username: "",
            password: "",
            confPassword: "",
            nCC: 0
        }
    },
    methods: {
        alterar(){

            var newInfo = {};
            var alterar = true;

            if(this.nome != ""){
                newInfo.nome = this.nome;
            }
            if(this.username != ""){
                newInfo.username = this.username;
            }
            if(this.password != ""){
                if(this.password != this.confPassword){
                    alterar = false;
                    this.$emit('erro', "As passwords devem ser iguais.");
                }
                newInfo.password = this.password;
            }
            if(this.nCC != 0){
                newInfo.nCC = parseInt(this.nCC);
            }

            if(this.nome == "" && this.username == "" && this.password == "" && this.confPassword == "" && this.nCC == ""){
                alterar = false;
                this.$emit('erro', "Deve preencher pelo menos um campo para que alguma alteração seja efetuada.");
            }

            if(alterar){
                this.$emit('alterar', newInfo);

                this.nome = "";
                this.username = "";
                this.password = "";
                this.confPassword = "";
                this.nCC = 0;
            }
        },
        cancelar(e){
            if(e.srcElement.id == "wrapper" || e.srcElement.id == "close"){
                this.$emit('cancelar');  

                this.nome = "";
                this.username = "";
                this.password = "";
                this.confPassword = "";
                this.nCC = 0;
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
        width: 450px;
        height: 480px;
        padding: 50px;
        margin: auto;
        margin-top: 5%;
        text-align: justify;
        border-radius: 10px;
    }

    #innerDiv h3 {
        font-size: 25px;
        text-align: center;
    }

    #innerDiv button {
        margin: 20px 8px 0px 8px;
        width: 100px;
    }

    #innerDiv #btnAlterar {
        margin-left: 100px;
    }

    #innerDiv input, #innerDiv select {
        width: 200px;
        height: 25px;
        margin: 6px 0px 6px 0px;
        border-radius: 5px;
        padding: 0px 10px 0px 10px;
    }

    #innerDiv label {
        display: inline-block;
        width: 200px;
    }

    #innerDiv select {
        border: 2px solid black;
        height: 28px;
        width: 224px;
    }
</style>