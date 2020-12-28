<template>
    <div>
        <h2>Deixe em branco os campos que não pretende alterar.</h2>
        <h3>Nome atual: {{ this.info.nome }}</h3>
        <h3>Username atual: {{ this.info.username }}</h3>
        <h3>Cartão de cidadão atual: {{ this.info.nCC }}</h3>
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
        <button @click="alterar">Confirmar</button>
        <button @click="cancelar">Cancelar</button>
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
        cancelar(){
            this.nome = "";
            this.username = "";
            this.password = "";
            this.confPassword = "";
            this.nCC = 0;

            this.$emit('cancelar');
        }
    }
}
</script>