<template>
    <div v-if="info.empresario">
        <h2>Nome: {{ info.empresario.nome }}</h2>
        <h3>Cartão de cidadão: {{ info.empresario.nCC }}</h3>
    </div>
</template>

<script>
export default {
    name: 'EmpresarioInfo',
    props: {
        info :{
            type: Object,
            required: true
        }
    }
}
</script>