<template>
    <div>
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
        <button @click="create">Alterar evento</button>
        <button @click="cancelar">Cancelar</button>
    </div>
</template>

<script>
export default {
    name: 'AlterarEventoInfo',
    props: {
        evento: {
            type: Object,
            required: true
        },
        convidados: {
            type: Array,
            required: true
        }
    },
    data(){
        return {
            convidadosPorAdicionar: [],
            convidadosAdicionados: [],
            nome: "",
            descricao: "",
            exclusividade: "",
            dataInicio: "",
            dataFim: "",
            tipoPesquisa: "",
            textoPesquisa: ""
        }
    },
    watch: {
        evento: function(){
            this.loadInfo();
        },
        convidados: function(){
            this.loadInfo();
        }
    },
    computed: {
        assignKeys(){
            this.convidados.forEach(element => {
                element.key = convidados.indexOf(element);
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

            this.convidadosAdicionados.forEach(element => evento.convidados.push({id: element.convidado.id, tipo: element.tipoConvidado}));

            this.$emit('alterar', evento);

            this.textoPesquisa = "";
            this.tipoPesquisa = "";
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
            if(this.evento.evento && this.evento.participantes){
                this.nome = this.evento.evento.nome;
                this.descricao = this.evento.evento.descricao;
                this.exclusividade = this.evento.evento.exclusividade;
                var inicio = `${this.evento.evento.dataInicio.year.low}-${this.evento.evento.dataInicio.month.low}-${this.evento.evento.dataInicio.day.low}`;
                var fim = `${this.evento.evento.dataFim.year.low}-${this.evento.evento.dataFim.month.low}-${this.evento.evento.dataFim.day.low}`;

                if(this.evento.evento.dataInicio.month.low < 10){
                    inicio = inicio.substring(0, 5) + "0" + inicio.substring(5);
                }
                if(this.evento.evento.dataFim.month.low < 10){
                    fim = fim.substring(0, 5) + "0" + fim.substring(5);
                }
                if(this.evento.evento.dataInicio.day.low < 10){
                    inicio = inicio.substring(0, 8) + "0" + inicio.substring(8);
                }
                if(this.evento.evento.dataFim.day.low < 10){
                    fim = fim.substring(0, 8) + "0" + fim.substring(8);
                }

                this.dataInicio = inicio;
                this.dataFim = fim;

                this.convidados.forEach(element => {
                    var existe = false;
                    this.evento.participantes.forEach(el => {
                        if(el.tipo == element.tipoConvidado && el.id == element.convidado.id){
                            existe = true;
                        }
                    });

                    if(existe){
                        this.convidadosAdicionados.push(element);
                    } else {
                        this.convidadosPorAdicionar.push(element);
                    }
                });    
            }
        },
        cancelar(){
            this.$emit('cancelar');

            this.textoPesquisa = "";
            this.tipoPesquisa = "";
        }
    }
}
</script>

<style scoped>
div {
    border: 1px solid black;
}
</style>