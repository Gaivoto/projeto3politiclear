<template>
    <div>
        <div class="divWrapper">
            <h3>Participantes:</h3>
            <ul>
                <div v-for="par in info.participantes" v-bind:key="par.key">
                    <router-link v-if="isOutro(par)" tag="li" :to="{path: '/' + par.tipo + 's/' + par.id}">{{ par.tipo + " - " + par.nome }}</router-link>
                    <router-link v-if="isCidadaoCreditado(par)" tag="li" :to="{path: '/CidadaosCreditados/' + par.id}">{{ "Cidadao Creditado - " + par.nome }}</router-link>
                    <router-link v-if="isCidadaoRegistado(par)" tag="li" :to="{path: '/CidadaosRegistados/' + par.id}">{{ "Cidadao Registado - " + par.nome }}</router-link>
                    <router-link v-if="isOrganizacao(par)" tag="li" :to="{path: '/Organizacoes/' + par.id}">{{ "Organização - " + par.nome }}</router-link>
                    <router-view/>
                </div>
            </ul>
        </div>
        <div class="divWrapper">
            <h3>Vencedores:</h3>
            <ul>
                <div v-for="ven in info.vencedores" v-bind:key="ven.key">
                    <router-link v-if="isOutro(ven)" tag="li" :to="{path: '/' + ven.tipo + 's/' + ven.id}">{{ ven.tipo + " - " + ven.nome }}</router-link>
                    <router-link v-if="isCidadaoCreditado(ven)" tag="li" :to="{path: '/CidadaosCreditados/' + ven.id}">{{ "Cidadao Creditado - " + ven.nome }}</router-link>
                    <router-link v-if="isCidadaoRegistado(ven)" tag="li" :to="{path: '/CidadaosRegistados/' + ven.id}">{{ "Cidadao Registado - " + ven.nome }}</router-link>
                    <router-link v-if="isOrganizacao(ven)" tag="li" :to="{path: '/Organizacoes/' + ven.id}">{{ "Organização - " + ven.nome }}</router-link>
                    <router-view/>
                </div>
            </ul>       
        </div>
        <div class="divWrapper">
            <h3>Contratos gerados:</h3>
            <ul>
                <router-link tag="li" v-for="con in info.contratos" v-bind:key="con.key" :to="{path: '/contratos/' + con.id}">{{ con.nome }}</router-link>
                <router-view/>
            </ul>       
        </div>
    </div>
</template>

<script>
export default {
    name: 'ConcursoInfoLists',
    props: {
        info: {
            type: Object,
            required: true
        }
    },
    computed: {
        assignKeys(){
            this.info.participantes.forEach(element => {
                element.key = info.participantes.indexOf(element);
            })  

            this.info.vencedores.forEach(element => {
                element.key = info.vencedores.indexOf(element);
            })  

            this.info.contratos.forEach(element => {
                element.key = info.contratos.indexOf(element);
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