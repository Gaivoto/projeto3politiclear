<template>
    <div>
        <label for="titulo">Título:</label><br>
        <input type="text" name="titulo" v-model="titulo" autocomplete="off"><br>
        <label for="descricao">Descrição:</label><br>
        <textarea name="descricao" cols="50" rows="20" v-model="descricao"></textarea><br>
        <div>
            <label for="tipo">Tipo de assunto: </label>
            <select name="tipo" v-model="tipoPesquisa">
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
            <div v-for="ass in assuntosPorAdicionar" v-bind:key="ass.key">
                <h3 v-if="display(ass)">{{ass.tipoAssunto + " - " + ass.assunto.nome}}<button @click="adicionarAssunto(ass)">Adicionar</button></h3>
            </div>
        </div>
        <div>
            <h2>Assuntos adicionados:</h2>
            <div v-for="ass in assuntosAdicionados" v-bind:key="ass.key">
                <h3>{{ass.tipoAssunto + " - " + ass.assunto.nome}}<button @click="removerAssunto(ass)">Remover</button></h3>
            </div>
        </div>
        <button @click="create">Criar registo</button>
        <button @click="cancelar">Cancelar</button>
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

            this.assuntosPorAdicionar = [];
            this.assuntosAdicionados = [];
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
        }
    }
}
</script>

<style scoped>
div {
    border: 1px solid black;
}
</style>