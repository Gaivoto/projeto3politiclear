<template>
    <div>
        <label for="criar">Criar contrato como:</label>
        <input type="radio" value="user" name="criar" v-model="criar"> {{ this.$store.getters.getUser.info.nome }}
        <input type="radio" value="org" name="criar" v-model="criar"> Uma organização a que pertença
        <div v-show="isOrganizacaoVisible">
            <label for="organizacao">Escolha a organização com a qual pretende criar o concurso:</label>
            <select name="organizacao" v-model="organizacao">
                <option v-for="org in organizacoes" v-bind:key="org.id" :value="org.id">{{ org.nome }}</option>
            </select>
        </div><br>
        <label for="nome">Nome:</label>
        <input tSype="text" name="titulo" v-model="nome" autocomplete="off"><br>
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
        <label for="conclusao">Conclusão:</label><br>
        <textarea name="conclusao" cols="50" rows="20" v-model="conclusao"></textarea><br>
        <div>
            <label for="tipoPro">Tipo de preponente: </label>
            <select name="tipoPro" v-model="tipoPesquisaPro">
                <option value="">Todos</option>
                <option value="Politico">Político</option>
                <option value="Empresario">Empresário</option>
                <option value="Organizacao">Organização</option>
                <option value="CidadaoRegistado">Cidadão Registado</option>
            </select>
            <label for="pesquisaPro">Pesquisa: </label>
            <input type="text" name="pesquisaPro" v-model="textoPesquisaPro" autocomplete="off">
            <div v-for="pro in proposicoesPorAdicionar" v-bind:key="pro.key">
                <h3 v-if="displayP(pro)">{{pro.tipoAssinatura + " - " + pro.assinatura.nome}}<button @click="adicionarProposicao(pro)">Adicionar</button></h3>
            </div>
        </div>
        <div>
            <h2>Preponentes adicionados:</h2>
            
            <div v-for="pro in proposicoesAdicionadas" v-bind:key="pro.key">
                <h3>{{pro.tipoAssinatura + " - " + pro.assinatura.nome}}<button @click="removerProposicao(pro)">Remover</button></h3>
            </div>
        </div>
        
        <div>
            <label for="tipoAss">Tipo de assinatura: </label>
            <select name="tipoAss" v-model="tipoPesquisaAss">
                <option value="">Todos</option>
                <option value="Politico">Político</option>
                <option value="Empresario">Empresário</option>
                <option value="Organizacao">Organização</option>
                <option value="CidadaoRegistado">Cidadão Registado</option>
            </select>
            <label for="pesquisaAss">Pesquisa: </label>
            <input type="text" name="pesquisaAss" v-model="textoPesquisaAss" autocomplete="off">
            <div v-for="ass in assinaturasPorAdicionar" v-bind:key="ass.key">
                <h3 v-if="displayA(ass)">{{ass.tipoAssinatura + " - " + ass.assinatura.nome}}<button @click="adicionarAssinatura(ass)">Adicionar</button></h3>
            </div>
        </div>
        <div>
            <h2>Assinaturas adicionadas:</h2>
            <div v-for="ass in assinaturasAdicionadas" v-bind:key="ass.key">
                <h3>{{ass.tipoAssinatura + " - " + ass.assinatura.nome}}<button @click="removerAssinatura(ass)">Remover</button></h3>
            </div>
        </div>

        <div>
            <label for="pesquisaCon">Pesquisa de concurso: </label>
            <input type="text" name="pesquisaCon" v-model="textoPesquisaCon" autocomplete="off">
            <div v-for="con in concursosPorAdicionar" v-bind:key="con.id">
                <h3 v-if="displayC(con)">{{con.nome}}<button @click="adicionarConcurso(con)">Adicionar</button></h3>
            </div>
        </div>
        <div>
            <h2>Concursos adicionados:</h2>
            <div v-for="con in concursosAdicionados" v-bind:key="con.id">
                <h3>{{con.nome}}<button @click="removerConcurso(con)">Remover</button></h3>
            </div>
        </div>
        <button @click="create">Criar contrato</button>
        <button @click="cancelar">Cancelar</button>
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
        }
    }
}
</script>

<style scoped>
div {
    border: 1px solid black;
}
</style>