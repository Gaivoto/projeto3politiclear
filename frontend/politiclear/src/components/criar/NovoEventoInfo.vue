<template>
    <div>
        <label for="criar">Criar evento como:</label>
        <input type="radio" value="user" name="criar" v-model="criar"> {{ this.$store.getters.getUser.info.nome }}
        <input type="radio" value="org" name="criar" v-model="criar"> Uma organização a que pertença
        <div v-show="isOrganizacaoVisible">
            <label for="organizacao">Escolha a organização com a qual pretende criar o evento:</label>
            <select name="organizacao" v-model="organizacao">
                <option v-for="org in organizacoes" v-bind:key="org.id" :value="org.id">{{ org.nome }}</option>
            </select>
        </div><br>
        <label for="nome">Nome:</label>
        <input type="text" name="titulo" v-model="nome" autocomplete="off"><br>
        <label for="exclusividade">Exclusividade:</label>
        <input type="radio" value="Publico" name="exclusividade" v-model="exclusividade">Público
        <input type="radio" value="Privado" name="exclusividade" v-model="exclusividade">Privado<br>
        <label for="dataInicio">Data de início:</label>
        <input type="date" name="dataInicio" v-model="dataInicio"><br>
        <label for="dataFim">Data de fim:</label>
        <input type="date" name="dataFim" v-model="dataFim"><br>
        <label for="descricao">Descrição:</label><br>
        <textarea name="descricao" cols="50" rows="20" v-model="descricao"></textarea><br>
        <div>
            <label for="tipo">Tipo de convidado: </label>
            <select name="tipo" v-model="tipoPesquisa">
                <option value="">Todos</option>
                <option value="Politico">Político</option>
                <option value="Empresario">Empresário</option>
                <option value="Organizacao">Organização</option>
                <option value="CidadaoCreditado">Cidadão Creditado</option>
                <option value="CidadaoRegistado">Cidadão Registado</option>
            </select>
            <label for="pesquisa">Pesquisa: </label>
            <input type="text" name="pesquisa" v-model="textoPesquisa" autocomplete="off">
            <div v-for="con in convidadosPorAdicionar" v-bind:key="con.key">
                <h3 v-if="display(con)">{{con.tipoConvidado + " - " + con.convidado.nome}}<button @click="adicionarConvidado(con)">Adicionar</button></h3>
            </div>
        </div>
        <div>
            <h2>Convidados adicionados:</h2>
            <div v-for="con in convidadosAdicionados" v-bind:key="con.key">
                <h3>{{con.tipoConvidado + " - " + con.convidado.nome}}<button @click="removerConvidado(con)">Remover</button></h3>
            </div>
        </div>
        <button @click="create">Criar evento</button>
        <button @click="cancelar">Cancelar</button>
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
        }
    }
}
</script>

<style scoped>
div {
    border: 1px solid black;
}
</style>