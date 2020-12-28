<template>
    <div v-if="info.registo">
        <h2>Título: {{ info.registo.titulo }}</h2>
        <router-link tag="h3" :to="{path: '/CidadaosCreditados/' + info.autor.id}">Autor: {{ info.autor.nome }}</router-link>
        <router-view/>
        <h3>Descrição: {{ info.registo.descricao }}</h3>
    </div>
</template>

<script>
export default {
    name: 'RegistoInfo',
    props: {
        info: {
            type: Object,
            required: true
        }
    }
}
</script>