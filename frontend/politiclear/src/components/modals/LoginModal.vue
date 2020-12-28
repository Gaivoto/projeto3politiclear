<template>
    <div>
        <label for="username">Username: </label>
        <input type="text" name="username" v-model="username" autocomplete="off"><br>
        <label for="password">Password: </label>
        <input type="password" name="password" v-model="password" autocomplete="off"><br>
        <button @click="login">Login</button><br>
        <p>Não tem conta? Registe-se como Cidadão</p>
        <button @click="registar">Registar</button>
        <button @click="close">Cancelar</button>
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
        close(){
            this.$emit('fechar');
            
            this.username = "";
            this.password = "";
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
        }
    }
}
</script>

<style scoped>
    div{
        border: 2px black solid;
    }
</style>