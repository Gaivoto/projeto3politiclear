<template>
    <div id="wrapper" @click="cancelar">
        <div id="innerDiv">
            <h3>Alterar Organização</h3>
            <h3>Deixe em branco os campos que não pretende alterar.</h3>
            <h4>Nome atual: {{ this.org.nome }}</h4>
            <h4>Tipo atual: {{ this.org.tipo }}</h4>
            <h4 v-if="this.org.dataCriacao">Data de criação: {{ this.org.dataCriacao.day.low + "/" +  this.org.dataCriacao.month.low + "/" + this.org.dataCriacao.year.low }}</h4>
            <h4>Descrição: {{ this.org.descricao }}</h4>
            <h4>NIPC: {{ this.org.nipc }}</h4>
            <label for="nome">Nome: </label>
            <input type="text" name="nome" v-model="nome" autocomplete="off"><br>
            <label for="tipo">Tipo: </label>
            <select name="tipo" v-model="tipo">
                <option value="Partido">Partido</option>
                <option value="Empresa">Empresa</option>
                <option value="Outro">Outro</option>
            </select><br>
            <label for="dataCricao">Data de criação: </label>
            <input type="date" v-model="dataCriacao"><br>
            <label for="descricao">Descrição: </label>
            <input type="text" name="descricao" v-model="descricao" autocomplete="off"><br>
            <label for="nipc">NIPC: </label>
            <input type="number" min="1" max="99999999" name="nipc" v-model="nipc" autocomplete="off"><br>
            <button @click="alterar" id="btnAlterar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Alterar</button>
            <button id="close" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Cancelar</button>
        </div>    
    </div>
</template>

<script>
export default {
    name: 'AlterarOrgModal',
    props: {
        org: {
            type: Object,
            required: true
        }
    },
    data(){
        return {
            nome: "",
            dataCriacao: "",
            descricao: "",
            tipo: "",
            nipc: 0
        }
    },
    methods: {
        alterar(){
            const organizacao = {organizacao: {}, id: 0};
            var alterar = false;

            organizacao.id = this.org.id;

            if(this.nome != ""){
                organizacao.organizacao.nome = this.nome;
                alterar = true;
            }
            if(this.dataCriacao != ""){
                organizacao.organizacao.dataCriacao = this.dataCriacao;
                alterar = true;
            }
            if(this.descricao != ""){
                organizacao.organizacao.descricao = this.descricao;
                alterar = true;
            }
            if(this.descricao != ""){
                organizacao.organizacao.descricao = this.descricao;
                alterar = true;
            }
            if(this.nipc != 0){
                organizacao.organizacao.nipc = this.nipc;
                alterar = true;
            }

            if(alterar){
                this.$emit('alterar', organizacao);

                this.nome = "";
                this.descricao = "";
                this.dataCriacao = "";
                this.tipo = "";
                this.nipc = 0;
            } else {
                this.$emit('error', "Deve preencher pelo menos um campo para que seja efetuada alguma alteração.")
            }
        },
        cancelar(e){
            if(e.srcElement.id == "wrapper" || e.srcElement.id == "close"){
                this.$emit('cancelar');  

                this.nome = "";
                this.descricao = "";
                this.dataCriacao = "";
                this.tipo = "";
                this.nipc = 0;
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
        height: 80%;
        padding: 30px 50px 50px 50px;
        margin: auto;
        margin-top: 2%;
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
        margin: 6px 0px 6px 0px;
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