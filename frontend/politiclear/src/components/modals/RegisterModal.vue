<template>
    <div id="wrapper" @click="close">
        <div id="innerDiv">
            <h3>Registo Cidadão</h3>
            <input type="text" name="nome" v-model="nome" autocomplete="off" placeholder="Nome"><br>
            <input type="text" name="username" v-model="username" autocomplete="off" placeholder="Username"><br>
            <input type="password" name="password" v-model="password" autocomplete="off" placeholder="Password"><br>
            <input type="password" name="confpassword" v-model="confpassword" autocomplete="off" placeholder="Confirmar password"><br>
            <input type="number" min="1" max="99999999" name="nCC" v-model="nCC" autocomplete="off" placeholder="Cartão de cidadão"><br>
            <button @click="registar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Registar</button>
            <button id="close" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Cancelar</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'RegisterModal',
    data(){
        return {
            nome: "",
            username: "",
            password: "",
            confpassword: "",
            nCC: null
        }
    },
    methods: {
        close(e){
            if(e.srcElement.id == "wrapper" || e.srcElement.id == "close"){
                this.$emit('fechar');

                this.nome = "";
                this.username = "";
                this.password = "";
                this.confpassword = "";
                this.nCC = null;       
            }
        },
        registar(){
            if(this.password != this.confpassword){
                this.$emit('erro', "As passwords devem ser iguais.");
            } else {
                axios({
                    method: 'post',
                    url: 'http://localhost:3000/api/CidadaoRegistado/registar',
                    data: {
                        nome: this.nome,
                        username: this.username,
                        nCC: this.nCC,
                        password: this.password
                    }
                })
                .then((response) => {
                    this.$emit('erro', "Registado com sucesso. Pode efetuar login.");
                    this.$emit('fechar');

                    this.nome = "";
                    this.username = "";
                    this.password = "";
                    this.confpassword = "";
                    this.nCC = null;
                })
                .catch(error => {
                    if(error.response.data.details){
                        this.$emit('erro', error.response.data.details[0].message);    
                    } else {
                        this.$emit('erro', error.response.data);
                    }
                })
            }

            this.nome = "";
            this.username = "";
            this.password = "";
            this.confpassword = "";
            this.nCC = null;
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
        width: 25%;
        height: 45%;
        padding: 50px;
        margin: auto;
        margin-top: 10%;
        border-radius: 10px;
    }

    #innerDiv input {
        width: 200px;
        height: 25px;
        margin: 6px 0px 6px 0px;
        border-radius: 5px;
        padding: 0px 10px 0px 10px;
    }

    #innerDiv h3 {
        font-size: 25px;
    }

    #innerDiv button {
        margin: 25px 8px 0px 8px;
    }
</style>