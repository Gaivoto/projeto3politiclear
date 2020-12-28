<template>
    <div v-if="info.evento">
        <h2>Nome: {{ info.evento.nome }}</h2>
        <h3>Data de início: {{ info.evento.dataInicio.day.low + "/" + info.evento.dataInicio.month.low + "/" + info.evento.dataInicio.year.low }}</h3>
        <h3>Data de fim: {{ info.evento.dataFim.day.low + "/" + info.evento.dataFim.month.low + "/" + info.evento.dataFim.year.low }}</h3>
        <router-link v-if="info.organizador.tipo != 'Organizacao'" tag="h3" :to="{path: '/' + info.organizador.tipo + 's/' + info.organizador.id}">Organizador: {{ info.organizador.tipo + " - " + info.organizador.nome }}</router-link>
        <router-link v-else tag="h3" :to="{path: '/Organizacoes/' + info.organizador.id}">Organizador: {{ "Organização - " + info.organizador.nome }}</router-link>
        <router-link tag="h3" :to="{path: '/' + info.criador.tipo + 's/' + info.criador.id}">Criador: {{ info.criador.tipo + " - " + info.criador.nome }}</router-link>
        <router-view/>
        <h3>Exclusividade: {{ info.evento.exclusividade }}</h3>
        <h3>Descrição: {{ info.evento.descricao }}</h3>
    </div>
</template>

<script>
export default {
    name: 'EventoInfo',
    props: {
        info: {
            type: Object,
            required: true
        }
    }
}
</script>