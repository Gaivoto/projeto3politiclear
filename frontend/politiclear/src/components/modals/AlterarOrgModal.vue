<template>
    <div>
        <h2>Deixe em branco os campos que não pretende alterar.</h2>
        <h3>Nome atual: {{ this.org.nome }}</h3>
        <h3>Tipo atual: {{ this.org.tipo }}</h3>
        <h3 v-if="this.org.dataCriacao">Data de criação: {{ this.org.dataCriacao.day.low + "/" +  this.org.dataCriacao.month.low + "/" + this.org.dataCriacao.year.low }}</h3>
        <h3>Descrição: {{ this.org.descricao }}</h3>
        <h3>NIPC: {{ this.org.nipc }}</h3>
        <label for="nome">Nome: </label>
        <input type="text" name="nome" v-model="nome" autocomplete="off"><br>
        <label for="tipo">Tipo: </label>
        <select name="tipo" v-model="tipo">
            <option value="Partido">Partido</option>
            <option value="Empresa">Empresa</option>
            <option value="Outro">Outro</option>
        </select><br>
        <label for="dataCricao">Data de criação: </label>
        <input type="date" v-model="dataCriacao"><br>
        <label for="descricao">Descrição: </label>
        <input type="text" name="descricao" v-model="descricao" autocomplete="off"><br>
        <label for="nipc">NIPC: </label>
        <input type="number" min="1" max="99999999" name="nipc" v-model="nipc" autocomplete="off"><br>
        <button @click="alterar">Alterar</button>
        <button @click="cancelar">Cancelar</button>
    </div>
</template>

<script>
export default {
    name: 'AlterarOrgModal',
    props: {
        org: {
            type: Object,
            required: true
        }
    },
    data(){
        return {
            nome: "",
            dataCriacao: "",
            descricao: "",
            tipo: "",
            nipc: 0
        }
    },
    methods: {
        alterar(){
            const organizacao = {organizacao: {}, id: 0};
            var alterar = false;

            organizacao.id = this.org.id;

            if(this.nome != ""){
                organizacao.organizacao.nome = this.nome;
                alterar = true;
            }
            if(this.dataCriacao != ""){
                organizacao.organizacao.dataCriacao = this.dataCriacao;
                alterar = true;
            }
            if(this.descricao != ""){
                organizacao.organizacao.descricao = this.descricao;
                alterar = true;
            }
            if(this.descricao != ""){
                organizacao.organizacao.descricao = this.descricao;
                alterar = true;
            }
            if(this.nipc != 0){
                organizacao.organizacao.nipc = this.nipc;
                alterar = true;
            }

            if(alterar){
                this.$emit('alterar', organizacao);

                this.nome = "";
                this.descricao = "";
                this.dataCriacao = "";
                this.tipo = "";
                this.nipc = 0;
            } else {
                this.$emit('error', "Deve preencher pelo menos um campo para que seja efetuada alguma alteração.")
            }
        },
        cancelar(){
            this.$emit('cancelar');
        }
    }
}
</script>

<style scoped>
    div{
        border: 2px black solid;
    }
</style>