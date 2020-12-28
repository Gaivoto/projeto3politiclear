<template>
    <div>
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
        <button @click="criar">Criar</button>
        <button @click="cancelar">Cancelar</button>
    </div>
</template>

<script>
export default {
    name: 'CriarOrgModal',
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
        criar(){
            const organizacao = {
                nome: this.nome,
                descricao: this.descricao,
                dataCriacao: this.dataCriacao,
                tipo: this.tipo,
                nipc: this.nipc
            };

            this.$emit('criar', organizacao);

            this.nome = "";
            this.descricao = "";
            this.dataCriacao = "";
            this.tipo = "";
            this.nipc = 0;
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