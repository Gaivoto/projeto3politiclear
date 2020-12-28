<template>
    <div v-if="info.concurso">
        <h2>Nome: {{ info.concurso.nome }}</h2>
        <h3>Data de início: {{ info.concurso.dataInicio.day.low + "/" + info.concurso.dataInicio.month.low + "/" + info.concurso.dataInicio.year.low }}</h3>
        <h3>Data de fim: {{ info.concurso.dataFim.day.low + "/" + info.concurso.dataFim.month.low + "/" + info.concurso.dataFim.year.low }}</h3>
        <router-link v-if="info.organizador.tipo != 'Organizacao'" tag="h3" :to="{path: '/' + info.organizador.tipo + 's/' + info.organizador.id}">Organizador: {{ info.organizador.tipo + " - " + info.organizador.nome }}</router-link>
        <router-link v-else tag="h3" :to="{path: '/Organizacoes/' + info.organizador.id}">Organizador: {{ "Organizacao - " + info.organizador.nome }}</router-link>
        <router-link tag="h3" :to="{path: '/' + info.criador.tipo + 's/' + info.criador.id}">Criador: {{ info.criador.tipo + " - " + info.criador.nome }}</router-link>
        <router-view/>
        <h3>Tipo: {{ info.concurso.tipo }}</h3>
        <h3>Descrição: {{ info.concurso.descricao }}</h3>
    </div>
</template>

<script>
export default {
    name: 'ConcursoInfo',
    props: {
        info: {
            type: Object,
            required: true
        }
    }
}
</script>