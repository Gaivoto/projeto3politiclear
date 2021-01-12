<template>
    <div>
        <div class="divWrapper">
            <h3>Participantes:</h3>
            <ul v-if="this.participantes">
                <div v-for="par in participantes" v-bind:key="par.key">
                    <router-link v-if="isOutro(par)" tag="li" :to="{path: '/' + par.tipo + 's/' + par.id}">{{ par.tipo + " - " + par.nome }}</router-link>
                    <router-link v-if="isCidadaoCreditado(par)" tag="li" :to="{path: '/CidadaosCreditados/' + par.id}">{{ "Cidadao Creditado - " + par.nome }}</router-link>
                    <router-link v-if="isCidadaoRegistado(par)" tag="li" :to="{path: '/CidadaosRegistados/' + par.id}">{{ "Cidadao Registado - " + par.nome }}</router-link>
                    <router-link v-if="isOrganizacao(par)" tag="li" :to="{path: '/Organizacoes/' + par.id}">{{ "Organização - " + par.nome }}</router-link>
                    <router-view/>
                </div>
            </ul>  
        </div>
    </div>
</template>

<script>
export default {
    name: 'EventoInfoLists',
    props: {
        participantes: {
            type: Array
        }
    },
    computed: {
        assignKeys(){
            this.participantes.forEach(element => {
                element.key = participante.indexOf(element);
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