<template>
    <div>
        <label for="tipo">Tipo de utilizador:</label>
        <select name="tipo" id="tipo" v-model="tipoPesquisa">
            <option value="">Todos</option>
            <option value="Politicos">Político</option>
            <option value="Empresarios">Empresário</option>
            <option value="Administradores">Administrador</option>
            <option value="CidadaosRegistados">Cidadãos Registados</option>
            <option value="CidadaosCreditados">Cidadãos Creditados</option>
        </select>
        <input type="text" id="nome" v-model="texto" autocomplete="off">
        <button id="pesquisar" v-on:click="pesquisar">Pesquisar</button>
    </div>
</template>

<script>
export default {
    name: 'UsersSearch',
    data(){
        return {
            tipoPesquisa: "",
            texto: ""
        }
    },
    methods: {
        pesquisar(){
            const pesquisa = {
                tipoPesquisa: this.tipoPesquisa,
                textoPesquisa: this.texto
            }

            switch(pesquisa.tipoPesquisa){
                case "Politicos":
                    pesquisa.tipo = "Politico";
                    break;
                case "Empresarios":
                    pesquisa.tipo = "Empresario";
                    break;
                case "Administradores":
                    pesquisa.tipo = "Administrador";
                    break;
                case "CidadaosRegistados":
                    pesquisa.tipo = "CidadaoRegistado";
                    break;
                case "CidadaosCreditados":
                    pesquisa.tipo = "CidadaoCreditado";
                    break;
            }

            this.$emit('pesquisar', pesquisa); 
        }
    }
}
</script>