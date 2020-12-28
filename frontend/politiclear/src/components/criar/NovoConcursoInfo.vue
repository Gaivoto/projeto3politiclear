<template>
    <div>
        <label for="criar">Criar concurso como:</label>
        <input type="radio" value="user" name="criar" v-model="criar"> {{ this.$store.getters.getUser.info.nome }}
        <input type="radio" value="org" name="criar" v-model="criar"> Uma organização a que pertença
        <div v-show="isOrganizacaoVisible">
            <label for="organizacao">Escolha a organização com a qual pretende criar o concurso:</label>
            <select name="organizacao" v-model="organizacao">
                <option v-for="org in organizacoes" v-bind:key="org.id" :value="org.id">{{ org.nome }}</option>
            </select>
        </div><br>
        <label for="nome">Nome:</label>
        <input type="text" name="titulo" v-model="nome" autocomplete="off"><br>
        <label for="tipo">Tipo:</label>
        <select name="tipo" v-model="tipo">
            <option value="Construcao">Construção</option>
            <option value="Outro">Outro</option>
        </select><br>
        <label for="dataInicio">Data de início:</label>
        <input type="date" name="dataInicio" v-model="dataInicio"><br>
        <label for="dataFim">Data de fim:</label>
        <input type="date" name="dataFim" v-model="dataFim"><br>
        <label for="descricao">Descrição:</label><br>
        <textarea name="descricao" cols="50" rows="20" v-model="descricao"></textarea><br>
        <div>
            <label for="tipoPar">Tipo de participante: </label>
            <select name="tipoPar" v-model="tipoPesquisaPar">
                <option value="">Todos</option>
                <option value="Politico">Político</option>
                <option value="Empresario">Empresário</option>
                <option value="Organizacao">Organização</option>
                <option value="CidadaoRegistado">Cidadão Registado</option>
            </select>
            <label for="pesquisaPar">Pesquisa: </label>
            <input type="text" name="pesquisaPar" v-model="textoPesquisaPar" autocomplete="off">
            <div v-for="par in participantesPorAdicionar" v-bind:key="par.key">
                <h3 v-if="displayP(par)">{{par.tipoParticipante + " - " + par.participante.nome}}<button @click="adicionarParticipante(par)">Adicionar</button></h3>
            </div>
        </div>
        <div>
            <h2>Participantes adicionados:</h2>
            <div v-for="par in participantesAdicionados" v-bind:key="par.key">
                <h3>{{par.tipoParticipante + " - " + par.participante.nome}}<button @click="removerParticipante(par)">Remover</button></h3>
            </div>
        </div>
        <div>
            <label for="tipoVen">Tipo de vencedor: </label>
            <select name="tipoVen" v-model="tipoPesquisaVen">
                <option value="">Todos</option>
                <option value="Politico">Político</option>
                <option value="Empresario">Empresário</option>
                <option value="Organizacao">Organização</option>
                <option value="CidadaoRegistado">Cidadão Registado</option>
            </select>
            <label for="pesquisaVen">Pesquisa: </label>
            <input type="text" name="pesquisaVen" v-model="textoPesquisaVen" autocomplete="off">
            <div v-for="ven in vencedoresPorAdicionar" v-bind:key="ven.key">
                <h3 v-if="displayV(ven)">{{ven.tipoParticipante + " - " + ven.participante.nome}}<button @click="adicionarVencedor(ven)">Adicionar</button></h3>
            </div>
        </div>
        <div>
            <h2>Vencedores adicionados:</h2>
            <div v-for="ven in vencedoresAdicionados" v-bind:key="ven.key">
                <h3>{{ven.tipoParticipante + " - " + ven.participante.nome}}<button @click="removerVencedor(ven)">Remover</button></h3>
            </div>
        </div>
        <button @click="create">Criar concurso</button>
        <button @click="cancelar">Cancelar</button>
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
        }
    }
}
</script>

<style scoped>
div {
    border: 1px solid black;
}
</style>