<template>
    <div id="wrapper" @click="cancelar">
        <div v-if="this.user.user" id="innerDiv">
            <h3>Alterar Utilizador</h3>
            <h4>Deixe em branco os campos que não pretende alterar.</h4>
            <h4>Nome atual: {{ this.user.user.nome }}</h4>
            <h4>Username atual: {{ this.user.user.username }}</h4>
            <h4>Cartão cidadão atual: {{ this.user.user.nCC }}</h4>
            <label for="nome">Nome: </label>
            <input type="text" name="nome" v-model="nome" autocomplete="off"><br>
            <label for="username">Username: </label>
            <input type="text" name="username" v-model="username" autocomplete="off"><br>
            <label for="password">Password: </label>
            <input type="password" name="password" v-model="password" autocomplete="off"><br>
            <label for="confpassword">Confirmar password: </label>
            <input type="password" name="confpassword" v-model="confpassword" autocomplete="off"><br>
            <label for="nCC">Cartão de cidadão: </label>
            <input type="number" min="1" max="99999999" name="nCC" v-model="nCC" autocomplete="off"><br>
            <div v-if="this.user.user.tipoUser == 'Politico'">
                <label for="tipo">Partido: </label>
                <select name="tipo" v-model="partido">
                    <option v-for="par in partidos" v-bind:key="par.id" v-bind:value="par.id">{{ par.nome }}</option>
                </select><br>
                <label for="habilitacoes">Habilitações: </label>
                <select name="habilitacoes" v-model="habilitacoes">
                    <option value="Nenhuma">Nenhuma</option>
                    <option value="4º ano">4º ano</option>
                    <option value="6º ano">6º ano</option>
                    <option value="9º ano">9º ano</option>
                    <option value="12º ano">12º ano</option>
                    <option value="Licenciatura">Licenciatura</option>
                    <option value="Mestrado">Mestrado</option>
                    <option value="Doutoramento">Doutoramento</option>
                </select><br>
                <label for="circuloEleitoral">Círculo eleitoral: </label>
                <select name="circuloEleitoral" v-model="circuloEleitoral">
                    <option value="Norte">Norte</option>
                    <option value="Centro">Centro</option>
                    <option value="Sul">Sul</option>
                    <option value="Açores">Açores</option>
                    <option value="Madeira">Madeira</option>
                </select><br>
            </div>
            <button @click="alterar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick" id="btnAlterar">Alterar</button>
            <button id="close" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Cancelar</button>
        </div>    
    </div>
</template>

<script>
export default {
    name: 'CriarOrgModal',
    props: {
        user: {
            type: Object,
            required: true
        },
        partidos: {
            type: Array,
            required: true
        }
    },
    data(){
        return {
            nome: "",
            username: "",
            password: "",
            confpassword: "",
            nCC: 0,
            partido: 0,
            circuloEleitoral: "",
            habilitacoes: ""
        }
    },
    methods: {
        alterar(){
            const user = { info: {}, tipo: "", id: 0};
            var valido =  true;

            user.tipo = this.user.user.tipoUser;
            user.id = this.user.user.id;

            if(this.nome != ""){
                user.info.nome = this.nome;
            }
            if(this.username != ""){
                user.info.username = this.username;
            }
            if(this.nCC != 0){
                user.info.nCC = this.nCC;
            }
            if(this.password != ""){
                if(this.password != this.confpassword){
                    valido = false;
                    this.$emit('erro', "As passwords não são iguais.");
                } else {
                    user.info.password = this.password;    
                }
            }
            if(this.partido != 0){
                user.info.partido = this.partido;
            }
            if(this.habilitacoes != ""){
                user.info.habilitacoes = this.habilitacoes;
            }
            if(this.circuloEleitoral != ""){
                user.info.circuloEleitoral = this.circuloEleitoral;
            }

            if(this.nome == "" && this.username == "" && this.nCC == 0 && this.password == "" && this.circuloEleitoral == "" && this.habilitacoes == "" && this.partido == 0){
                valido = false;
                this.$emit('erro', "Deve preencher pelo menos um campo para que seja efetuada alguma alteração.");
            }

            if(valido){
                this.$emit('alterar', user);

                this.nome = "";
                this.username = "";
                this.password = "";
                this.confpassword = "";
                this.nCC = 0;
                this.partido = 0;
                this.circuloEleitoral = "";
                this.habilitacoes = "";    
            }
        },
        cancelar(e){
            if(e.srcElement.id == "wrapper" || e.srcElement.id == "close"){
                this.$emit('cancelar');  

                this.nome = "";
                this.username = "";
                this.password = "";
                this.confpassword = "";
                this.nCC = 0;
                this.partido = 0;
                this.circuloEleitoral = "";
                this.habilitacoes = "";    
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
        height: 700px;
        padding: 5px 50px 50px 50px;
        margin: auto;
        margin-top: 0.1%;
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
        margin-left: 80px;
    }

    #innerDiv input, #innerDiv select {
        width: 200px;
        height: 25px;
        margin: 4px 0px 4px 0px;
        border-radius: 5px;
        padding: 0px 10px 0px 10px;
    }

    #innerDiv label {
        display: inline-block;
        width: 160px;
    }

    #innerDiv select {
        border: 2px solid black;
        height: 28px;
        width: 224px;
    }
</style>