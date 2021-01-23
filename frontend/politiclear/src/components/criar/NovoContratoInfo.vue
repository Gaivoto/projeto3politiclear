<template>
    <div class="outer">
        <div class="wrapperInfo">
            <label for="criar">Criar contrato como:</label>
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
            <label for="conclusao">Conclusão:</label><br>
            <textarea name="conclusao" cols="50" rows="20" v-model="conclusao"></textarea><br>    
        </div>
        <div class="wrapperTabelas">
            <div class="divSearchbar">
                <label for="tipoPro">Tipo de preponente: </label>
                <select name="tipoPro" v-model="tipoPesquisaPro">
                    <option value="">Todos</option>
                    <option value="Politico">Político</option>
                    <option value="Empresario">Empresário</option>
                    <option value="Organizacao">Organização</option>
                    <option value="CidadaoRegistado">Cidadão Registado</option>
                </select>
                <div>
                    <label for="pesquisaPro">Pesquisa: </label>
                    <input type="text" name="pesquisaPro" v-model="textoPesquisaPro" autocomplete="off">    
                </div>
            </div>
            <div class="createH3Wrapper">
                <h3 class="h31">Preponentes por adicionar:</h3>
                <h3 class="h32">Preponentes adicionados:</h3>
            </div>
            <div class="divTable">
                <ul>
                    <li v-for="pro in proposicoesPorAdicionar" v-bind:key="pro.key" v-show="displayP(pro)"><p>{{pro.tipoAssinatura + " - " + pro.assinatura.nome}}</p><button class="btnLista" @click="adicionarProposicao(pro)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Adicionar</button></li>
                </ul>
            </div>
            <div class="divTable">
                <ul>
                    <li v-for="pro in proposicoesAdicionadas" v-bind:key="pro.key" v-show="displayP(pro)"><p>{{pro.tipoAssinatura + " - " + pro.assinatura.nome}}</p><button class="btnLista" @click="removerProposicao(pro)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Remover</button></li>
                </ul>
            </div>
        </div>

        <div class="wrapperTabelas">
            <div class="divSearchbar">
                <label for="tipoAss">Tipo de assinatura: </label>
                <select name="tipoAss" v-model="tipoPesquisaAss">
                    <option value="">Todos</option>
                    <option value="Politico">Político</option>
                    <option value="Empresario">Empresário</option>
                    <option value="Organizacao">Organização</option>
                    <option value="CidadaoRegistado">Cidadão Registado</option>
                </select>
                <div>
                    <label for="pesquisaAss">Pesquisa: </label>
                    <input type="text" name="pesquisaAss" v-model="textoPesquisaAss" autocomplete="off">    
                </div>
            </div>

            <div class="createH3Wrapper">
                <h3 class="h31">Assinaturas por adicionar:</h3>
                <h3 class="h32">Assinaturas adicionadas:</h3>
            </div>
            <div class="divTable">
                <ul>
                    <li v-for="ass in assinaturasPorAdicionar" v-bind:key="ass.key" v-show="displayA(ass)"><p>{{ass.tipoAssinatura + " - " + ass.assinatura.nome}}</p><button class="btnLista"  @click="adicionarAssinatura(ass)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Adicionar</button></li>
                </ul>
            </div>
            <div class="divTable">
                <ul>
                    <li v-for="ass in assinaturasAdicionadas" v-bind:key="ass.key" v-show="displayA(ass)"><p>{{ass.tipoAssinatura + " - " + ass.assinatura.nome}}</p><button class="btnLista" @click="removerAssinatura(ass)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Remover</button></li>
                </ul>
            </div>
        </div>

        <div class="wrapperTabelas">
            <div class="divSearchbar">
                <label for="pesquisaCon">Pesquisa de concurso: </label>
                <input type="text" name="pesquisaCon" v-model="textoPesquisaCon" autocomplete="off">
            </div>

            <div class="createH3Wrapper">
                <h3 class="h31">Concursos por adicionar:</h3>
                <h3 class="h32">Concursos adicionados:</h3>
            </div>
            <div class="divTable">
                <ul>
                    <li v-for="con in concursosPorAdicionar" v-bind:key="con.id" v-show="displayC(con)"><p>{{con.nome}}</p><button class="btnLista" @click="adicionarConcurso(con)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Adicionar</button></li>
                </ul>
            </div>
            <div class="divTable">
                <ul>
                    <li v-for="con in concursosAdicionados" v-bind:key="con.id" v-show="displayC(con)"><p>{{con.nome}}</p><button class="btnLista" @click="removerConcurso(con)" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Remover</button></li>
                </ul>
            </div>
        </div>
        
        <button class="outerBtn" @click="create" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Criar contrato</button>
        <button class="outerBtn" @click="cancelar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick">Cancelar</button>
    </div>
</template>

<script>
export default {
    name: 'NovoContratoInfo',
    props: {
        assinaturas: {
            type: Array,
            required: true
        },
        organizacoes: {
            type: Array,
            required: true
        },
        concursos: {
            type: Array,
            required: true
        }
    },
    data(){
        return {
            proposicoesPorAdicionar: [],
            proposicoesAdicionadas: [],
            assinaturasPorAdicionar: [],
            assinaturasAdicionadas: [],
            concursosPorAdicionar: [],
            concursosAdicionados: [],
            criar: "user",
            nome: "",
            descricao: "",
            conclusao: "",
            tipo: "",
            dataInicio: "",
            dataFim: "",
            organizacao: 0,
            tipoPesquisaPro: "",
            textoPesquisaPro: "",
            tipoPesquisaAss: "",
            textoPesquisaAss: "",
            textoPesquisaCon: ""
        }
    },
    watch: {
        assinaturas: function(){
            this.loadInfo();
        },
        concurso: function(){
            this.loadInfo();
        }
    },
    computed: {
        assignKey(){  
            this.assinaturasPorAdicionar.forEach(element => {
                element.key = assinaturasPorAdicionar.indexOf(element);
            })    

            this.proposicoesPorAdicionar.forEach(element => {
                element.key = proposicoesPorAdicionar.indexOf(element);
            })
        },
        isOrganizacaoVisible(){
            return this.criar == "org";
        }
    },
    methods: {
        create(){
            const contrato = {
                nome: this.nome,
                descricao: this.descricao,
                conclusao: this.conclusao,
                tipo: this.tipo,
                dataInicio: this.dataInicio,
                dataFim: this.dataFim,
                assinaturas: [],
                proposicoes: [],
                concursos: []
            }

            var adicionado = false;

            if(this.criar == "user"){
                this.proposicoesAdicionadas.forEach(element => {
                    if(element.tipoAssinatura == this.$store.getters.getUser.info.tipo && element.assinatura.id == this.$store.getters.getUser.info.id){
                        adicionado = true;
                    }
                })
            }

            if(this.criar == "org"){
                this.proposicoesAdicionadas.forEach(element => {
                    if(element.tipoAssinatura == "Organizacao" && element.assinatura.id == this.organizacao){
                        adicionado = true;
                    }
                })
            }

            if(this.organizacao != 0 && this.criar == "org"){
                contrato.organizacao = this.organizacao;
            }
            
            this.assinaturasAdicionadas.forEach(element => contrato.assinaturas.push({id: element.assinatura.id, tipo: element.tipoAssinatura}));
            
            this.proposicoesAdicionadas.forEach(element => contrato.proposicoes.push({id: element.assinatura.id, tipo: element.tipoAssinatura}));
            
            this.concursosAdicionados.forEach(element => contrato.concursos.push({id: element.id}));
            
            if(adicionado){
                this.$emit('create', contrato);    
            } else {
                this.$emit('erro', "A entidade com a qual criar um contrato deve ser um proponente desse contrato.");
            }

            this.assinaturasPorAdicionar = this.assinaturas;
            this.assinaturasAdicionadas = [];
            this.concursosPorAdicionar = this.concursos;
            this.concursosAdicionados = [];
            this.proposicoesPorAdicionar = this.assinaturas;
            this.proposicoesAdicionadas = [];
            this.criar = "user";
            this.nome = "";
            this.descricao = "";
            this.conclusao = "";
            this.exclusividade = "";
            this.dataInicio = "";
            this.dataFim = "";
            this.organizacao = 0;
            this.tipoPesquisaPar = "";
            this.textoPesquisaPar = "";
            this.tipoPesquisaVen = "";
            this.textoPesquisaVen = "";
        },
        displayA(assinatura){
            var boolTipo = (this.tipoPesquisaAss != "") ? assinatura.tipoAssinatura == this.tipoPesquisaAss : true;
            var boolTexto = (this.textoPesquisaAss != "") ? assinatura.assinatura.nome.toLowerCase().includes(this.textoPesquisaAss) : true;

            return (boolTipo && boolTexto);
        },
        displayP(proposicao){
            var boolTipo = (this.tipoPesquisaPro != "") ? proposicao.tipoAssinatura == this.tipoPesquisaPro : true;
            var boolTexto = (this.textoPesquisaPro != "") ? proposicao.assinatura.nome.toLowerCase().includes(this.textoPesquisaPro) : true;

            return (boolTipo && boolTexto && proposicao.tipoAssinatura != "CidadaoRegistado");
        },
        displayC(concurso){

            return (this.textoPesquisaCon != "") ? concurso.nome.toLowerCase().includes(this.textoPesquisaCon) : true;
        },
        adicionarAssinatura(assinatura){
            this.assinaturasAdicionadas.push(assinatura);
            this.assinaturasPorAdicionar = this.assinaturasPorAdicionar.filter(element => !(element.tipoAssinatura == assinatura.tipoAssinatura && element.assinatura.id == assinatura.assinatura.id));
        },
        removerAssinatura(assinatura){   
            var existe = false;

            this.proposicoesAdicionadas.forEach(element => {
                if(element.tipoAssinatura == assinatura.tipoAssinatura && element.assinatura.id == assinatura.assinatura.id){
                    existe = true;
                }
            })

            if(existe){
                this.proposicoesPorAdicionar.push(assinatura);
                this.proposicoesAdicionadas = this.proposicoesAdicionadas.filter(element => !(element.tipoAssinatura == assinatura.tipoAssinatura && element.assinatura.id == assinatura.assinatura.id));
            }

            this.assinaturasPorAdicionar.push(assinatura);
            this.assinaturasAdicionadas = this.assinaturasAdicionadas.filter(element => !(element.tipoAssinatura == assinatura.tipoAssinatura && element.assinatura.id == assinatura.assinatura.id));
        },
        adicionarProposicao(proposicao){
            var existe = false;

            this.assinaturasAdicionadas.forEach(element => {
                if(element.tipoAssinatura == proposicao.tipoAssinatura && element.assinatura.id == proposicao.assinatura.id){
                    existe = true;
                }
            })

            if(!existe){
                this.assinaturasAdicionadas.push(proposicao);
                this.assinaturasPorAdicionar = this.assinaturasPorAdicionar.filter(element => !(element.tipoAssinatura == proposicao.tipoAssinatura && element.assinatura.id == proposicao.assinatura.id));
            }

            this.proposicoesAdicionadas.push(proposicao);
            this.proposicoesPorAdicionar = this.proposicoesPorAdicionar.filter(element => !(element.tipoAssinatura == proposicao.tipoAssinatura && element.assinatura.id == proposicao.assinatura.id));
        },
        removerProposicao(proposicao){
            this.proposicoesPorAdicionar.push(proposicao);
            this.proposicoesAdicionadas = this.proposicoesAdicionadas.filter(element => !(element.tipoAssinatura == proposicao.tipoAssinatura && element.assinatura.id == proposicao.assinatura.id));
        },
        adicionarConcurso(concurso){
            this.concursosAdicionados.push(concurso);
            this.concursosPorAdicionar = this.concursosPorAdicionar.filter(element => element.id != concurso.id);
        },
        removerConcurso(concurso){   
            this.concursosPorAdicionar.push(concurso);
            this.concursosAdicionados = this.concursosAdicionados.filter(element => element.id != concurso.id);
        },
        loadInfo(){
            this.assinaturasPorAdicionar = this.assinaturas;
            this.concursosPorAdicionar = this.concursos;
            this.proposicoesPorAdicionar = this.assinaturas;
        },
        cancelar(){
            this.$emit('cancelar');

            this.assinaturasPorAdicionar = this.assinaturas;
            this.assinaturasAdicionadas = [];
            this.concursosPorAdicionar = this.concursos;
            this.concursosAdicionados = [];
            this.proposicoesPorAdicionar = this.assinaturas;
            this.proposicoesAdicionadas = [];
            this.criar = "user";
            this.nome = "";
            this.descricao = "";
            this.conclusao = "";
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
        height: 3780px;
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
        margin-bottom: 25px;
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