<template>
    <div v-if="info.politico">
        <h2><b>Nome:</b> {{ info.politico.nome }}</h2>
        <router-link tag="h3" :to="{path: '/organizacoes/' + info.partido.id}"><b>Partido:</b> {{ info.partido.nome }}</router-link>
        <router-view/>
        <h3><b>Circulo eleitoral:</b> {{ info.politico.circuloEleitoral }}</h3>
        <h3><b>Habilitações:</b> {{ info.politico.habilitacoes }}</h3>
        <h3><b>Cartão de cidadão:</b> {{ info.politico.nCC }}</h3>
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