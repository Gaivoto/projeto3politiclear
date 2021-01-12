<template>
    <div id="wrapper" @click="cancelar">
        <div id="innerDiv">
            <h3>Criar Organização</h3>
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
            <button @click="criar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick" id="btnCriar">Criar</button>
            <button id="close" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Cancelar</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CriarOrgModal',
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
        criar(){
            const organizacao = {
                nome: this.nome,
                descricao: this.descricao,
                dataCriacao: this.dataCriacao,
                tipo: this.tipo,
                nipc: this.nipc
            };

            this.$emit('criar', organizacao);

            this.nome = "";
            this.descricao = "";
            this.dataCriacao = "";
            this.tipo = "";
            this.nipc = 0;
        },
        cancelar(e){
            if(e.srcElement.id == "wrapper" || e.srcElement.id == "close"){
                this.$emit('cancelar');
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
        width: 24%;
        height: 45%;
        padding: 50px;
        margin: auto;
        margin-top: 10%;
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

    #innerDiv #btnCriar {
        margin-left: 75px;
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
        width: 140px;
    }

    #innerDiv select {
        border: 2px solid black;
        height: 28px;
        width: 224px;
    }
</style>