<template>
    <div v-if="info.empresario">
        <h2><b>Nome:</b> {{ info.empresario.nome }}</h2>
        <h3><b>Cartão de cidadão:</b> {{ info.empresario.nCC }}</h3>
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