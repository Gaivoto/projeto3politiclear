<template>
    <div class="outer">
        <div class="wrapperInfo">
            <label for="criar">Criar evento como:</label>
            <input class="radioInput" type="radio" value="user" name="criar" v-model="criar"> {{ this.$store.getters.getUser.info.nome }}
            <input class="radioInput" type="radio" value="org" name="criar" v-model="criar"> Uma organização a que pertença
            <div v-show="isOrganizacaoVisible">
                <label for="organizacao">Organização:</label>
                <select name="organizacao" v-model="organizacao">
                    <option v-for="org in organizacoes" v-bind:key="org.id" :value="org.id">{{ org.nome }}</option>
                </select>
            </div><br>
            <label for="nome">Nome:</label>
            <input class="normalInput" type="text" name="titulo" v-model="nome" autocomplete="off"><br>
            <label for="exclusividade">Exclusividade:</label>
            <input class="radioInput" type="radio" value="Publico" name="exclusividade" v-model="exclusividade">Público
            <input class="radioInput" type="radio" value="Privado" name="exclusividade" v-model="exclusividade">Privado<br>
            <label for="dataInicio">Data de início:</label>
            <input class="normalInput" type="date" name="dataInicio" v-model="dataInicio"><br>
            <label for="dataFim">Data de fim:</label>
            <input class="normalInput" type="date" name="dataFim" v-model="dataFim"><br>
            <label for="descricao">Descrição:</label><br>
            <textarea name="descricao" cols="50" rows="20" v-model="descricao"></textarea><br>
        </div>
        <div class="wrapperTabelas">
            <div class="divSearchbar">
                <label for="tipo">Tipo de convidado: </label>
                <select name="tipo" v-model="tipoPesquisa" style="margin-right: 450px;">
                    <option value="">Todos</option>
                    <option value="Politico">Político</option>
                    <option value="Empresario">Empresário</option>
                    <option value="Organizacao">Organização</option>
                    <option value="CidadaoCreditado">Cidadão Creditado</option>
                    <option value="CidadaoRegistado">Cidadão Registado</option>
                </select>
                <label for="pesquisa">Pesquisa: </label>
                <input type="text" name="pesquisa" v-model="textoPesquisa" autocomplete="off">
            </div>
            <h3>Convidados por adicionar:</h3>
            <h3>Convidados adicionados:</h3>
            <div class="divTable">
                <ul>
                    <li v-for="con in convidadosPorAdicionar" v-bind:key="con.key" v-show="display(con)"><p>{{con.tipoConvidado + " - " + con.convidado.nome}}</p><button class="btnLista" @click="adicionarConvidado(con)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Adicionar</button></li>
                </ul>
            </div>
            <div class="divTable">
                <ul>
                    <li v-for="con in convidadosAdicionados" v-bind:key="con.key" v-show="display(con)"><p>{{con.tipoConvidado + " - " + con.convidado.nome}}</p><button class="btnLista" @click="removerConvidado(con)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Remover</button></li>
                </ul>
            </div>
        </div>
        <button class="outerBtn" @click="create" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Criar evento</button>
        <button class="outerBtn" @click="cancelar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Cancelar</button>
    </div>
</template>

<script>
export default {
    name: 'NovoEventoInfo',
    props: {
        convidados: {
            type: Array,
            required: true
        },
        organizacoes: {
            type: Array,
            required: true
        }
    },
    data(){
        return {
            convidadosPorAdicionar: [],
            convidadosAdicionados: [],
            criar: "user",
            nome: "",
            descricao: "",
            exclusividade: "",
            dataInicio: "",
            dataFim: "",
            organizacao: 0,
            tipoPesquisa: "",
            textoPesquisa: ""
        }
    },
    watch: {
        convidados: function(){
            this.loadInfo();
        }
    },
    computed: {
        isOrganizacaoVisible(){
            return this.criar == "org";
        },
        assignKeys(){
            this.convidadosPorAdicionar.forEach(element => {
                element.key = convidadosPorAdicionar.indexOf(element);
            }) 
        }
    },
    methods: {
        create(){
            const evento = {
                nome: this.nome,
                descricao: this.descricao,
                exclusividade: this.exclusividade,
                dataInicio: this.dataInicio,
                dataFim: this.dataFim,
                convidados: []
            }

            if(this.organizacao != 0 && this.criar == "org"){
                evento.organizacao = this.organizacao;
            }

            this.convidadosAdicionados.forEach(element => evento.convidados.push({id: element.convidado.id, tipo: element.tipoConvidado}));

            this.$emit('create', evento);

            this.convidadosPorAdicionar = this.convidados;
            this.convidadosAdicionados = [];
            this.criar = "user";
            this.nome = "";
            this.descricao = "";
            this.exclusividade = "";
            this.dataInicio = "";
            this.dataFim = "";
            this.organizacao = 0;
            this.tipoPesquisa = "";
            this.textoPesquisa = "";
        },
        display(convidado){
            var boolTipo = (this.tipoPesquisa != "") ? convidado.tipoConvidado == this.tipoPesquisa : true;
            var boolTexto = (this.textoPesquisa != "") ? convidado.convidado.nome.toLowerCase().includes(this.textoPesquisa) : true;

            return (boolTipo && boolTexto);
        },
        adicionarConvidado(convidado){
            this.convidadosAdicionados.push(convidado);
            this.convidadosPorAdicionar = this.convidadosPorAdicionar.filter(element => !(element.tipoConvidado == convidado.tipoConvidado && element.convidado.id == convidado.convidado.id));
        },
        removerConvidado(convidado){   
            this.convidadosPorAdicionar.push(convidado);
            this.convidadosAdicionados = this.convidadosAdicionados.filter(element => !(element.tipoConvidado == convidado.tipoConvidado && element.convidado.id == convidado.convidado.id));
        },
        loadInfo(){
            this.convidadosPorAdicionar = this.convidados;
        },
        cancelar(){
            this.$emit('cancelar');

            this.convidadosPorAdicionar = this.convidados;
            this.convidadosAdicionados = [];
            this.criar = "user";
            this.nome = "";
            this.descricao = "";
            this.exclusividade = "";
            this.dataInicio = "";
            this.dataFim = "";
            this.organizacao = 0;
            this.tipoPesquisa = "";
            this.textoPesquisa = "";
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
    li {
        list-style: none;
        text-align: justify;
        margin: 15px 20px 15px 10px;
    }

    .outer {
        height: 1600px;
        background-color: #8CA3B4;
    }

    .wrapperInfo {
        width: 60%;
        margin-left: 17%;
        margin-right: 19%;
        text-align: justify;
    }

    .wrapperInfo label {
        font-size: 17px;
        margin: 15px 0px 15px 50px;
        font-weight: bold;
        width: 200px;
        display: inline-block;
    }

    .wrapperInfo .radioInput {
        position: relative;
        top: 5px;
        height: 25px;
        margin: 10px 0px 20px 10px;
        padding: 0px 10px 0px 10px;
    }

    .wrapperInfo .normalInput {
        width: 200px;
        height: 25px;
        margin: 10px 0px 20px 10px;
        border-radius: 5px;
        padding: 0px 10px 0px 10px;
    }

    .wrapperInfo select {
        width: 220px;
        height: 28px;
        margin: 10px 0px -5px 10px;
        border-radius: 5px;
        padding: 0px 10px 0px 10px;
    }

    .wrapperInfo textarea {
        width: 1000px;
        height: 300px;
        margin: 6px 0px 6px 0px;
        border-radius: 5px;
        padding: 0px 10px 0px 10px;
    }

    .divSearchbar {
        background-color: #B2B8CB;
        padding: 20px 35px 45px 35px;
        width: 88%;
        border-radius: 20px;
        margin: auto;
        margin-bottom: 25px;
    }

    .divSearchbar > select {
        height: 25px;
        width: 300px;
        font-size: 16px;
        margin: -2px 20px 0px 5px;
        float: left;
        border-radius: 5px;
        background-color: #DDDDDD;
    }

    .divSearchbar > input {
        height: 18px;
        width: 300px;
        font-size: 16px;
        margin-right: 15px;
        float: right;
        border-radius: 5px;
        background-color: #DDDDDD;
    }

    .divSearchbar > label {
        font-size: 18px;
        font-weight: 600;
        float: left;
        border-radius: 5px;
    }

    .wrapperTabelas {
        height: 680px;
        margin-top: 10px;
    }

    .divTable {
        overflow: auto;
        height: 600px;
        float: left;
        width: 44%;
        margin: 2% 0.1% 0% 2.7%;
        padding: 20px 15px 20px 15px;
        background-color: #cccccc;
        border-radius: 20px;
        overflow: auto;
    }

    h3 {
        color: black;
        font-size: 20px;
        margin-left: 14.3%;
        margin-right: 14.3%;
        display: inline;
        background-color: #9e8a7c;
        padding: 6px 15px 6px 15px;
        border-radius: 15px;
    }

    p {
        display: inline;
        width: 200px;
    }

    .btnLista {
        float: right;
    }

    .outerBtn {
        margin: 25px 25px 10px 25px;
        width: 160px;
        padding: 5px;
        height: 35px;
    }
</style>