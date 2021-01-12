<template>
    <div>
        <div class="divWrapper">
            <h3>Proposições:</h3>
            <ul>
                <div v-for="pro in info.proposicoes" v-bind:key="pro.key">
                    <router-link v-if="isOutro(pro)" tag="li" :to="{path: '/' + pro.tipo + 's/' + pro.id}">{{ pro.tipo + " - " + pro.nome }}</router-link>
                    <router-link v-if="isCidadaoCreditado(pro)" tag="li" :to="{path: '/CidadaosCreditados/' + pro.id}">{{ "Cidadao Creditado - " + pro.nome }}</router-link>
                    <router-link v-if="isCidadaoRegistado(pro)" tag="li" :to="{path: '/CidadaosRegistados/' + pro.id}">{{ "Cidadao Registado - " + pro.nome }}</router-link>
                    <router-link v-if="isOrganizacao(pro)" tag="li" :to="{path: '/Organizacoes/' + pro.id}">{{ "Organização - " + pro.nome }}</router-link>
                    <router-view/>
                </div>
            </ul>       
        </div>
        <div class="divWrapper">
            <h3>Assinaturas:</h3>
            <ul>
                <div v-for="ass in info.assinaturas" v-bind:key="ass.key">
                    <router-link v-if="isOutro(ass)" tag="li" :to="{path: '/' + ass.tipo + 's/' + ass.id}">{{ ass.tipo + " - " + ass.nome }}</router-link>
                    <router-link v-if="isCidadaoCreditado(ass)" tag="li" :to="{path: '/CidadaosCreditados/' + ass.id}">{{ "Cidadao Creditado - " + ass.nome }}</router-link>
                    <router-link v-if="isCidadaoRegistado(ass)" tag="li" :to="{path: '/CidadaosRegistados/' + ass.id}">{{ "Cidadao Registado - " + ass.nome }}</router-link>
                    <router-link v-if="isOrganizacao(ass)" tag="li" :to="{path: '/Organizacoes/' + ass.id}">{{ "Organização - " + ass.nome }}</router-link>
                    <router-view/>
                </div>
            </ul>       
        </div>
        <div class="divWrapper">
            <h3>Concursos que geraram este contrato:</h3>
            <ul>
                <router-link tag="li" v-for="con in info.concursos" v-bind:key="con.key" :to="{path: '/concursos/' + con.id}">{{ con.nome }}</router-link>
                <router-view/>
            </ul>       
        </div>
    </div>
</template>

<script>
export default {
    name: 'ContratoInfoLists',
    props: {
        info: {
            type: Object,
            required: true
        }
    },
    computed: {
        assignKeys(){
            this.info.proposicoes.forEach(element => {
                element.key = info.proposicoes.indexOf(element);
            })  

            this.info.assinaturas.forEach(element => {
                element.key = info.assinaturas.indexOf(element);
            })  

            this.info.concursos.forEach(element => {
                element.key = info.concursos.indexOf(element);
            })    
        }    
    },
    methods: {
        isOrganizacao(el){
            return el.tipo == 'Organizacao';
        },
        isCidadaoCreditado(el){
            return el.tipo == 'CidadaoCreditado';
        },
        isCidadaoRegistado(el){
            return el.tipo == 'CidadaoRegistado';
        },
        isOutro(el){
            return (!this.isOrganizacao(el) && !this.isCidadaoCreditado(el) && !this.isCidadaoRegistado(el));
        }
    }
}
</script>

<style scoped>
</style>