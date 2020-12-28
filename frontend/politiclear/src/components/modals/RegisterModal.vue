<template>
    <div>
        <label for="nome">Nome: </label>
        <input type="text" name="nome" v-model="nome" autocomplete="off"><br>
        <label for="username">Username: </label>
        <input type="text" name="username" v-model="username" autocomplete="off"><br>
        <label for="password">Password:</label>
        <input type="password" name="password" v-model="password" autocomplete="off"><br>
        <label for="confpassword">Confirmar password: </label>
        <input type="password" name="confpassword" v-model="confpassword" autocomplete="off"><br>
        <label for="nCC">Cartão de cidadão: </label>
        <input type="number" min="1" max="99999999" name="nCC" v-model="nCC" autocomplete="off"><br>
        <button @click="registar">Registar</button>
        <button @click="close">Cancelar</button>
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
            nCC: 0
        }
    },
    methods: {
        close(){
            this.$emit('fechar');

            this.nome = "";
            this.username = "";
            this.password = "";
            this.confpassword = "";
            this.nCC = 0;
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
                .then((response) => this.$emit('erro', "Registado com sucesso. Pode efetuar login."))
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
            this.nCC = 0;
        }
    }
}
</script>

<style scoped>
    div{
        border: 2px black solid;
    }
</style>