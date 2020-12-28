<template>
    <div>
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
        <button @click="create">Alterar concurso</button>
        <button @click="cancelar">Cancelar</button>
    </div>
</template>

<script>
export default {
    name: 'AlterarConcursoInfo',
    props: {
        concurso: {
            type: Object,
            required: true
        },
        participantes: {
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
            nome: "",
            descricao: "",
            tipo: "",
            dataInicio: "",
            dataFim: "",
            tipoPesquisaPar: "",
            textoPesquisaPar: "",
            tipoPesquisaVen: "",
            textoPesquisaVen: ""
        }
    },
    watch: {
        concurso: function(){
            this.loadInfo();
        },
        participantes: function(){
            this.loadInfo();
        }
    },
    computed: {
        assignKeys(){
            this.participantes.forEach(element => {
                element.key = participantes.indexOf(element);
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

            this.participantesAdicionados.forEach(element => concurso.participantes.push({id: element.participante.id, tipo: element.tipoParticipante}));

            this.vencedoresAdicionados.forEach(element => concurso.vencedores.push({id: element.participante.id, tipo: element.tipoParticipante}));

            this.$emit('alterar', concurso);

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
            if(this.concurso.concurso && this.concurso.participantes && this.concurso.vencedores){
                this.nome = this.concurso.concurso.nome;
                this.descricao = this.concurso.concurso.descricao;
                this.tipo = this.concurso.concurso.tipo;
                var inicio = `${this.concurso.concurso.dataInicio.year.low}-${this.concurso.concurso.dataInicio.month.low}-${this.concurso.concurso.dataInicio.day.low}`;
                var fim = `${this.concurso.concurso.dataFim.year.low}-${this.concurso.concurso.dataFim.month.low}-${this.concurso.concurso.dataFim.day.low}`;

                if(this.concurso.concurso.dataInicio.month.low < 10){
                    inicio = inicio.substring(0, 5) + "0" + inicio.substring(5);
                }
                if(this.concurso.concurso.dataFim.month.low < 10){
                    fim = fim.substring(0, 5) + "0" + fim.substring(5);
                }
                if(this.concurso.concurso.dataInicio.day.low < 10){
                    inicio = inicio.substring(0, 8) + "0" + inicio.substring(8);
                }
                if(this.concurso.concurso.dataFim.day.low < 10){
                    fim = fim.substring(0, 8) + "0" + fim.substring(8);
                }

                this.dataInicio = inicio;
                this.dataFim = fim;

                this.participantes.forEach(element => {
                    var existeP = false;
                    var existeV = false;

                    this.concurso.participantes.forEach(el => {
                        if(el.tipo == element.tipoParticipante && el.id == element.participante.id){
                            existeP = true;
                        }
                    });

                    this.concurso.vencedores.forEach(el => {
                        if(el.tipo == element.tipoParticipante && el.id == element.participante.id){
                            existeV = true;
                        }
                    });

                    if(existeP){
                        this.participantesAdicionados.push(element);
                    } else {
                        this.participantesPorAdicionar.push(element);
                    }

                    if(existeV){
                        this.vencedoresAdicionados.push(element);
                    } else {
                        this.vencedoresPorAdicionar.push(element);
                    }
                });    
            }
        },
        cancelar(){
            this.$emit('cancelar');

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