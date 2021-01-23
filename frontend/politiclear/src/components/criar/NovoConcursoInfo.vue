<template>
    <div class="outer">
        <div class="wrapperInfo">
            <label for="criar">Criar concurso como:</label>
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
            <label for="tipo">Tipo:</label>
            <select name="tipo" v-model="tipo">
                <option value="Construção">Construção</option>
                <option value="Educação">Educação</option>
                <option value="Saúde">Saúde</option>
                <option value="Outro">Outro</option>
            </select><br>
            <label for="dataInicio">Data de início:</label>
            <input class="normalInput" type="date" name="dataInicio" v-model="dataInicio"><br>
            <label for="dataFim">Data de fim:</label>
            <input class="normalInput" type="date" name="dataFim" v-model="dataFim"><br>
            <label for="descricao">Descrição:</label><br>
            <textarea name="descricao" cols="50" rows="20" v-model="descricao"></textarea><br>    
        </div>
        <div class="wrapperTabelas">
            <div class="divSearchbar">
                <label for="tipoPar">Tipo de participante: </label>
                <select name="tipoPar" v-model="tipoPesquisaPar">
                    <option value="">Todos</option>
                    <option value="Politico">Político</option>
                    <option value="Empresario">Empresário</option>
                    <option value="Organizacao">Organização</option>
                    <option value="CidadaoRegistado">Cidadão Registado</option>
                </select>
                <div>
                    <label for="pesquisaPar">Pesquisa: </label>
                    <input type="text" name="pesquisaPar" v-model="textoPesquisaPar" autocomplete="off">    
                </div>
            </div>
            <div class="createH3Wrapper">
                <h3 class="h31">Participantes por adicionar:</h3>
                <h3 class="h32">Participantes adicionados:</h3>
            </div>
            <div class="divTable">
                <ul>
                    <li v-for="par in participantesPorAdicionar" v-bind:key="par.key" v-show="displayP(par)"><p>{{par.tipoParticipante + " - " + par.participante.nome}}</p><button class="btnLista" @click="adicionarParticipante(par)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Adicionar</button></li>
                </ul>
            </div>
            <div class="divTable">
                <ul>
                    <li v-for="par in participantesAdicionados" v-bind:key="par.key" v-show="displayP(par)"><p>{{par.tipoParticipante + " - " + par.participante.nome}}</p><button class="btnLista" @click="removerParticipante(par)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Remover</button></li>
                </ul>
            </div>
        </div>
        <div class="wrapperTabelas">
            <div class="divSearchbar">
                <label for="tipoVen">Tipo de vencedor: </label>
                <select name="tipoVen" v-model="tipoPesquisaVen">
                    <option value="">Todos</option>
                    <option value="Politico">Político</option>
                    <option value="Empresario">Empresário</option>
                    <option value="Organizacao">Organização</option>
                    <option value="CidadaoRegistado">Cidadão Registado</option>
                </select>
                <div>
                    <label for="pesquisaVen">Pesquisa: </label>
                    <input type="text" name="pesquisaVen" v-model="textoPesquisaVen" autocomplete="off">      
                </div>
            </div>
            <div class="createH3Wrapper">
                <h3 class="h31">Vencedores por adicionar:</h3>
                <h3 class="h32">Vencedores adicionados:</h3>    
            </div>
            <div class="divTable">
                <ul>
                    <li v-for="ven in vencedoresPorAdicionar" v-bind:key="ven.key" v-show="displayV(ven)"><p>{{ven.tipoParticipante + " - " + ven.participante.nome}}</p><button class="btnLista" @click="adicionarVencedor(ven)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Adicionar</button></li>
                </ul>
            </div>
            <div class="divTable">
                <ul>
                    <li v-for="ven in vencedoresAdicionados" v-bind:key="ven.key" v-show="displayV(ven)"><p>{{ven.tipoParticipante + " - " + ven.participante.nome}}</p><button class="btnLista" @click="removerVencedor(ven)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Remover</button></li>
                </ul>
            </div>
        </div>
        <button class="outerBtn" @click="create" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Criar concurso</button>
        <button class="outerBtn" @click="cancelar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Cancelar</button>
    </div>
</template>

<script>
export default {
    name: 'NovoConcursoInfo',
    props: {
        participantes: {
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
            participantesPorAdicionar: [],
            participantesAdicionados: [],
            vencedoresPorAdicionar: [],
            vencedoresAdicionados: [],
            criar: "user",
            nome: "",
            descricao: "",
            tipo: "",
            dataInicio: "",
            dataFim: "",
            organizacao: 0,
            tipoPesquisaPar: "",
            textoPesquisaPar: "",
            tipoPesquisaVen: "",
            textoPesquisaVen: ""
        }
    },
    watch: {
        participantes: function(){
            this.loadInfo();
        }
    },
    computed: {
        isOrganizacaoVisible(){
            return this.criar == "org";
        },
        assignKeys(){
            this.participantesPorAdicionar.forEach(element => {
                element.key = participantesPorAdicionar.indexOf(element);
            })    

            this.vencedoresPorAdicionar.forEach(element => {
                element.key = vencedoresPorAdicionar.indexOf(element);
            })  
        }
    },
    methods: {
        create(){
            const concurso = {
                nome: this.nome,
                descricao: this.descricao,
                tipo: this.tipo,
                dataInicio: this.dataInicio,
                dataFim: this.dataFim,
                participantes: [],
                vencedores: []
            }

            if(this.organizacao != 0 && this.criar == "org"){
                concurso.organizacao = this.organizacao;
            }

            this.participantesAdicionados.forEach(element => concurso.participantes.push({id: element.participante.id, tipo: element.tipoParticipante}));

            this.vencedoresAdicionados.forEach(element => concurso.vencedores.push({id: element.participante.id, tipo: element.tipoParticipante}));

            this.$emit('create', concurso);

            this.participantesPorAdicionar = this.participantes;
            this.participantesAdicionados = [];
            this.vencedoresPorAdicionar = this.participantes;
            this.vencedoresAdicionados = [];
            this.criar = "user";
            this.nome = "";
            this.descricao = "";
            this.exclusividade = "";
            this.dataInicio = "";
            this.dataFim = "";
            this.organizacao = 0;
            this.tipoPesquisaPar = "";
            this.textoPesquisaPar = "";
            this.tipoPesquisaVen = "";
            this.textoPesquisaVen = "";
        },
        displayP(participante){
            var boolTipo = (this.tipoPesquisaPar != "") ? participante.tipoParticipante == this.tipoPesquisaPar : true;
            var boolTexto = (this.textoPesquisaPar != "") ? participante.participante.nome.toLowerCase().includes(this.textoPesquisaPar) : true;

            return (boolTipo && boolTexto);
        },
        displayV(vencedor){
            var boolTipo = (this.tipoPesquisaVen != "") ? vencedor.tipoParticipante == this.tipoPesquisaVen : true;
            var boolTexto = (this.textoPesquisaVen != "") ? vencedor.participante.nome.toLowerCase().includes(this.textoPesquisaVen) : true;

            return (boolTipo && boolTexto);
        },
        adicionarParticipante(participante){
            this.participantesAdicionados.push(participante);
            this.participantesPorAdicionar = this.participantesPorAdicionar.filter(element => !(element.tipoParticipante == participante.tipoParticipante && element.participante.id == participante.participante.id));
        },
        removerParticipante(participante){   
            var existe = false;

            this.vencedoresAdicionados.forEach(element => {
                if(element.tipoParticipante == participante.tipoParticipante && element.participante.id == participante.participante.id){
                    existe = true;
                }
            })

            if(existe){
                this.vencedoresPorAdicionar.push(participante);
                this.vencedoresAdicionados = this.vencedoresAdicionados.filter(element => !(element.tipoParticipante == participante.tipoParticipante && element.participante.id == participante.participante.id));
            }

            this.participantesPorAdicionar.push(participante);
            this.participantesAdicionados = this.participantesAdicionados.filter(element => !(element.tipoParticipante == participante.tipoParticipante && element.participante.id == participante.participante.id));
        },
        adicionarVencedor(vencedor){
            var existe = false;

            this.participantesAdicionados.forEach(element => {
                if(element.tipoParticipante == vencedor.tipoParticipante && element.participante.id == vencedor.participante.id){
                    existe = true;
                }
            })

            if(!existe){
                this.participantesAdicionados.push(vencedor);
                this.participantesPorAdicionar = this.participantesPorAdicionar.filter(element => !(element.tipoParticipante == vencedor.tipoParticipante && element.participante.id == vencedor.participante.id));
            }

            this.vencedoresAdicionados.push(vencedor);
            this.vencedoresPorAdicionar = this.vencedoresPorAdicionar.filter(element => !(element.tipoParticipante == vencedor.tipoParticipante && element.participante.id == vencedor.participante.id));
        },
        removerVencedor(vencedor){
            this.vencedoresPorAdicionar.push(vencedor);
            this.vencedoresAdicionados = this.vencedoresAdicionados.filter(element => !(element.tipoParticipante == vencedor.tipoParticipante && element.participante.id == vencedor.participante.id));
        },
        loadInfo(){
            this.participantesPorAdicionar = this.participantes;
            this.vencedoresPorAdicionar = this.participantes; 
        },
        cancelar(){
            this.$emit('cancelar');

            this.participantesPorAdicionar = this.participantes;
            this.participantesAdicionados = [];
            this.vencedoresPorAdicionar = this.participantes;
            this.vencedoresAdicionados = [];
            this.criar = "user";
            this.nome = "";
            this.descricao = "";
            this.exclusividade = "";
            this.dataInicio = "";
            this.dataFim = "";
            this.organizacao = 0;
            this.tipoPesquisaPar = "";
            this.textoPesquisaPar = "";
            this.tipoPesquisaVen = "";
            this.textoPesquisaVen = "";
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
        height: 2550px;
        background-color: #8CA3B4;
    }

    .wrapperInfo {
        width: 66%;
        margin-left: 14%;
        margin-right: 16%;
        text-align: justify;
    }

    .wrapperInfo label {
        font-size: 17px;
        margin: 15px 0px 15px 50px;
        font-weight: bold;
        width: 220px;
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
        width: 100%;
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
        margin-bottom: 30px;
    }

    .divSearchbar select {
        height: 25px;
        width: 300px;
        font-size: 16px;
        margin: -2px 20px 0px 5px;
        float: left;
        border-radius: 5px;
        background-color: #DDDDDD;
    }

    .divSearchbar input {
        height: 18px;
        width: 300px;
        font-size: 16px;
        margin-right: 15px;
        float: right;
        border-radius: 5px;
        background-color: #DDDDDD;
        margin-left: 10px;
    }

    .divSearchbar label {
        font-size: 18px;
        font-weight: 600;
        float: left;
        border-radius: 5px;
    }

    .wrapperTabelas {
        height: 850px;
        margin-top: 10px;
    }

    .divTable {
        height: 600px;
        float: left;
        width: 44%;
        margin: 2% 0.1% 0% 2.7%;
        padding: 20px 15px 20px 15px;
        background-color: #cccccc;
        border-radius: 20px;
        overflow: auto;
    }

    .createH3Wrapper {
        margin-left: 16%;
        margin-right: 16%;
    }

    .createH3Wrapper > h3 {
        color: black;
        font-size: 20px;
        display: inline;
        background-color: #9e8a7c;
        padding: 6px 15px 6px 15px;
        border-radius: 15px;
    }

    .createH3Wrapper > .h31 {
        float: left;
    }

    .createH3Wrapper > .h32 {
        float: right;
    }

    .divSearchbar > div {
        float: right;
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