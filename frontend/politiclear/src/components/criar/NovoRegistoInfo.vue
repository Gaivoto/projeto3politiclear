<template>
    <div class="outer">
        <div class="wrapperInfo">
            <input type="text" name="titulo" v-model="titulo" autocomplete="off" placeholder="Título"><br>
            <textarea name="descricao" cols="50" rows="20" v-model="descricao" placeholder="Descrição"></textarea><br>    
        </div>
        <div class="wrapperTabelas">
            <div class="divSearchbar">
                <label for="tipo">Tipo de assunto: </label>
                <select name="tipo" v-model="tipoPesquisa" style="margin-right: 450px;">
                    <option value="">Todos</option>
                    <option value="Evento">Evento</option>
                    <option value="Concurso">Concurso</option>
                    <option value="Contrato">Contrato</option>
                    <option value="Politico">Político</option>
                    <option value="Empresario">Empresário</option>
                    <option value="Organizacao">Organização</option>
                    <option value="CidadaoCreditado">Cidadão Creditado</option>
                    <option value="CidadaoRegistado">Cidadão Registado</option>
                </select>
                <label for="pesquisa">Pesquisa: </label>
                <input type="text" name="pesquisa" v-model="textoPesquisa" autocomplete="off">
            </div>
            <h3>Assuntos por adicionar:</h3>
            <h3>Assuntos adicionados:</h3>
            <div class="divTable">
                <ul>
                    <li v-for="ass in assuntosPorAdicionar" v-show="display(ass)" v-bind:key="ass.key"><p>{{ass.tipoAssunto + " - " + ass.assunto.nome}}</p><button class="btnLista" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick" @click="adicionarAssunto(ass)">Adicionar</button></li>
                </ul>
            </div>
            <div class="divTable">
                <ul>
                    <li v-for="ass in assuntosAdicionados" v-show="display(ass)" v-bind:key="ass.key"><p>{{ass.tipoAssunto + " - " + ass.assunto.nome}}</p><button class="btnLista" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick" @click="removerAssunto(ass)">Remover</button></li>
                </ul>
            </div>    
        </div>
        <button @click="create" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick" class="outerBtn">Criar registo</button>
        <button @click="cancelar" @mousedown="startBtnClick" @mouseup="finishBtnClick" @mouseleave="finishBtnClick" class="outerBtn">Cancelar</button>
    </div>
</template>

<script>
export default {
    name: 'NovoRegistoInfo',
    props: {
        assuntos: {
            type: Array,
            required: true
        }
    },
    data(){
        return {
            assuntosPorAdicionar: [],
            assuntosAdicionados: [],
            titulo: "",
            descricao: "",
            tipoPesquisa: "",
            textoPesquisa: ""
        }
    },
    watch: {
        assuntos: function(){
            this.loadInfo();
        }
    },
    computed: {
        assignKeys(){
            this.assuntosPorAdicionar = this.assuntos;

            this.assuntosPorAdicionar.forEach(element => {
                element.key = assuntosPorAdicionar.indexOf(element);
            })
        }    
    },
    methods: {
        create(){
            const registo = {
                titulo: this.titulo,
                descricao: this.descricao,
                assuntos: []
            }

            this.assuntosAdicionados.forEach(element => registo.assuntos.push({id: element.assunto.id, tipo: element.tipoAssunto}));

            this.$emit('create', registo);
            this.titulo = "";
            this.descricao = "";
            this.tipoPesquisa = "";
            this.textoPesquisa = "";
        },
        display(assunto){
            var boolTipo = (this.tipoPesquisa != "") ? assunto.tipoAssunto == this.tipoPesquisa : true;
            var boolTexto = (this.textoPesquisa != "") ? assunto.assunto.nome.toLowerCase().includes(this.textoPesquisa) : true;

            return (boolTipo && boolTexto);
        },
        adicionarAssunto(assunto){
            this.assuntosAdicionados.push(assunto);
            this.assuntosPorAdicionar = this.assuntosPorAdicionar.filter(element => !(element.tipoAssunto == assunto.tipoAssunto && element.assunto.id == assunto.assunto.id));
        },
        removerAssunto(assunto){   
            this.assuntosPorAdicionar.push(assunto);
            this.assuntosAdicionados = this.assuntosAdicionados.filter(element => !(element.tipoAssunto == assunto.tipoAssunto && element.assunto.id == assunto.assunto.id));
        },
        loadInfo(){
            this.assuntosPorAdicionar = this.assuntos;
        },
        cancelar(){
            this.$emit('cancelar');

            this.assuntosPorAdicionar = [];
            this.assuntosAdicionados = [];
            this.titulo = "";
            this.descricao = "";
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
        height: 1240px;
        background-color: #8CA3B4;
    }

    .wrapperInfo {
        display: inline-block;
    }

    .wrapperInfo input {
        width: 400px;
        height: 25px;
        margin: 6px 0px 6px 0px;
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
        margin-left: 16%;
        margin-right: 16%;
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