<template>
    <div v-if="info.registo">
        <h2><b>Título:</b> {{ info.registo.titulo }}</h2>
        <router-link tag="h3" :to="{path: '/CidadaosCreditados/' + info.autor.id}"><b>Autor:</b> {{ info.autor.nome }}</router-link>
        <router-view/>
        <h3><b>Descrição:</b> {{ info.registo.descricao }}</h3>
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