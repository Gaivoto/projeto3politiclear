<template>
    <div v-if="info.politico">
        <h2>Nome: {{ info.politico.nome }}</h2>
        <router-link tag="h3" :to="{path: '/organizacoes/' + info.partido.id}">Partido: {{ info.partido.nome }}</router-link>
        <router-view/>
        <h3>Circulo eleitoral: {{ info.politico.circuloEleitoral }}</h3>
        <h3>Habilitações: {{ info.politico.habilitacoes }}</h3>
        <h3>Cartão de cidadão: {{ info.politico.nCC }}</h3>
    </div>
</template>

<script>
export default {
    name: 'PoliticoInfo',
    props: {
        info: {
            type: Object,
            required: true
        }
    }
}
</script>