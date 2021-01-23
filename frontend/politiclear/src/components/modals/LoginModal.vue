<template>
    <div id="wrapper" @click="close">
        <div id="innerDiv">
            <h3>Login</h3>
            <input type="text" name="username" v-model="username" autocomplete="off" placeholder="Username"><br>
            <input type="password" name="password" v-model="password" autocomplete="off" placeholder="Password"><br>
            <button @click="login" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick" id="btnLogin">Login</button><br>
            <p>Não tem conta? Registe-se como Cidadão</p>
            <button @click="registar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Registar</button>
            <button id="close" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Cancelar</button>
        </div>    
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'LoginModal',
    data(){
        return {
            username: "",
            password: ""
        }
    },
    methods: {
        close(e){
            if(e.srcElement.id == "wrapper" || e.srcElement.id == "close"){
                this.$emit('fechar');
                
                this.username = "";
                this.password = "";    
            }
        },
        registar(){
            this.$emit('registar');
            
            this.username = "";
            this.password = "";
        },
        login(){
            axios({
                method: 'post',
                url: "http://localhost:3000/api/login",
                data: {
                    username: this.username,
                    password: this.password
                }
            })
            .then((response) => {
                this.$emit('update-user', response.data);
            })
            .catch((error) => {
                if(error.response.data.details){
                    this.$emit('erro', error.response.data.details[0].message);    
                } else {
                    this.$emit('erro', error.response.data);
                }
            });
            
            this.username = "";
            this.password = "";
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
        height: 360px;
        padding: 40px 50px 50px 50px;
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
        margin: 10px 8px 0px 8px;
    }

    #innerDiv p {
        margin-top: 25px;
    }

    #btnLogin {
        background-color: #405B6E;
        border: 2px solid black;
    }
</style>