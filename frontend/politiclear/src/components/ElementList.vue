<template>
    <div>
        <div v-for="el in this.lista" v-bind:key="el.id">
            <component class="card" v-bind:is="tipo" v-bind:info="el" v-on:apagar="apagarComentario" v-on:alterar-org="alterarOrg" v-on:alterar-user="alterarUser" v-on:desativar-user="desativarUser"></component>
            <hr>
        </div>
    </div>
</template>

<script>
import EmpresarioCard from "@/components/cards/EmpresarioCard.vue"
import RegistoCard from "@/components/cards/RegistoCard.vue"
import EventoCard from "@/components/cards/EventoCard.vue"
import ConcursoCard from "@/components/cards/ConcursoCard.vue"
import ContratoCard from "@/components/cards/ContratoCard.vue"
import PoliticoCard from "@/components/cards/PoliticoCard.vue"
import OrganizacaoCard from "@/components/cards/OrganizacaoCard.vue"
import ComentarioCard from "@/components/cards/ComentarioCard.vue"
import CidadaoCreditadoCard from "@/components/cards/CidadaoCreditadoCard.vue"
import UserCard from "@/components/cards/UserCard.vue"

export default {
    name: 'ElementList',
    components: {
        EmpresarioCard,
        RegistoCard,
        EventoCard,
        ConcursoCard,
        ContratoCard,
        PoliticoCard,
        OrganizacaoCard,
        ComentarioCard,
        CidadaoCreditadoCard,
        UserCard
    },
    props: {
        tipo: {
            type: String,
            required: true
        },
        lista: {
            type: Array
        }
    },
    methods: {
        apagarComentario(id){
            this.$emit('apagar', id);
        },
        alterarOrg(id){
            this.$emit('alterar-org', id);
        },
        alterarUser(user){
            this.$emit('alterar-user', user);
        },
        desativarUser(user){
            this.$emit('desativar-user', user);
        }
    }
}
</script>