<template>
    <div>
        <label for="tipo">Tipo: </label>
        <select name="tipo" v-model="tipo">
            <option value="Politico">Político</option>
            <option value="Empresario">Empresário</option>
            <option value="CidadaoRegistado">Cidadão Registado</option>
            <option value="CidadaoCreditado">Cidadão Creditado</option>
            <option value="Administrador">Administrador</option>
        </select><br>
        <label for="nome">Nome: </label>
        <input type="text" name="nome" v-model="nome" autocomplete="off"><br>
        <label for="username">Username: </label>
        <input type="text" name="username" v-model="username" autocomplete="off"><br>
        <label for="password">Password: </label>
        <input type="password" name="password" v-model="password" autocomplete="off"><br>
        <label for="confpassword">Confirmar password: </label>
        <input type="password" name="confpassword" v-model="confpassword" autocomplete="off"><br>
        <label for="nCC">Cartão de cidadão: </label>
        <input type="number" min="1" max="99999999" name="nCC" v-model="nCC" autocomplete="off"><br>
        <div v-if="this.tipo == 'Politico'">´
            <label for="tipo">Partido: </label>
            <select name="tipo" v-model="partido">
                <option v-for="par in partidos" v-bind:key="par.id" v-bind:value="par.id">{{ par.nome }}</option>
            </select><br>
            <label for="habilitacoes">Habilitações: </label>
            <select name="habilitacoes" v-model="habilitacoes">
                <option value="Nenhuma">Nenhuma</option>
                <option value="4º ano">4º ano</option>
                <option value="6º ano">6º ano</option>
                <option value="9º ano">9º ano</option>
                <option value="12º ano">12º ano</option>
                <option value="Licenciatura">Licenciatura</option>
                <option value="Mestrado">Mestrado</option>
                <option value="Doutoramento">Doutoramento</option>
            </select><br>
            <label for="circuloEleitoral">Círculo eleitoral: </label>
            <select name="circuloEleitoral" v-model="circuloEleitoral">
                <option value="Norte">Norte</option>
                <option value="Centro">Centro</option>
                <option value="Sul">Sul</option>
                <option value="Açores">Açores</option>
                <option value="Madeira">Madeira</option>
            </select><br>
        </div>
        <button @click="criar">Criar</button>
        <button @click="cancelar">Cancelar</button>
    </div>
</template>

<script>
export default {
    name: 'CriarOrgModal',
    props: {
        partidos: {
            type: Array,
            required: true
        }
    },
    data(){
        return {
            nome: "",
            username: "",
            password: "",
            confpassword: "",
            tipo: "",
            nCC: 0,
            partido: 0,
            circuloEleitoral: "",
            habilitacoes: ""
        }
    },
    methods: {
        criar(){
            const user = { info: {}, tipo: ""};
            var valido =  false;

            user.info.nome = this.nome;
            user.info.username = this.username;
            user.tipo = this.tipo;
            user.info.nCC = this.nCC;
            user.info.password = this.password;

            if(this.password == this.confpassword){
                valido = true;
            }

            if(this.partido != 0){
                user.info.partido = this.partido;
            }
            if(this.circuloEleitoral != ""){
                user.info.circuloEleitoral = this.circuloEleitoral;
            }
            if(this.habilitacoes != ""){
                user.info.habilitacoes = this.habilitacoes;
            }

            if(valido){
                this.$emit('criar', user);

                this.nome = "";
                this.username = "";
                this.password = "";
                this.confpassword = "";
                this.tipo = "";
                this.nCC = 0;
                this.partido = 0;
                this.circuloEleitoral = "";
                this.habilitacoes = "";    
            } else {
                this.$emit('erro', 'As passwords não são iguais.');
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