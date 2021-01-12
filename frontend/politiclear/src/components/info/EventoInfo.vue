<template>
    <div v-if="info.evento">
        <h2><b>Nome:</b> {{ info.evento.nome }}</h2>
        <h3><b>Data de início:</b> {{ info.evento.dataInicio.day.low + "/" + info.evento.dataInicio.month.low + "/" + info.evento.dataInicio.year.low }}</h3>
        <h3><b>Data de fim:</b> {{ info.evento.dataFim.day.low + "/" + info.evento.dataFim.month.low + "/" + info.evento.dataFim.year.low }}</h3>
        <router-link v-if="info.organizador.tipo != 'Organizacao'" tag="h3" :to="{path: '/' + info.organizador.tipo + 's/' + info.organizador.id}"><b>Organizador:</b> {{ info.organizador.tipo + " - " + info.organizador.nome }}</router-link>
        <router-link v-else tag="h3" :to="{path: '/Organizacoes/' + info.organizador.id}"><b>Organizador:</b> {{ "Organização - " + info.organizador.nome }}</router-link>
        <router-link tag="h3" :to="{path: '/' + info.criador.tipo + 's/' + info.criador.id}"><b>Criador:</b> {{ info.criador.tipo + " - " + info.criador.nome }}</router-link>
        <router-view/>
        <h3><b>Exclusividade:</b> {{ info.evento.exclusividade }}</h3>
        <h3><b>Descrição:</b> {{ info.evento.descricao }}</h3>
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