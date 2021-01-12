<template>
    <div>
        <div class="divWrapper">
            <h3>Assuntos:</h3>
            <ul v-if="this.assuntos">
                <div v-for="ass in assuntos" v-bind:key="ass.key">
                    <router-link v-if="isOutro(ass)" tag="li" :to="{path: '/' + ass.tipo + 's/' + ass.id}">{{ ass.tipo + " - " + ass.nome }}</router-link>
                    <router-link v-if="isCidadaoCreditado(ass)" tag="li" :to="{path: '/CidadaosCreditados/' + ass.id}">{{ "Cidadao Creditado - " + ass.nome }}</router-link>
                    <router-link v-if="isCidadaoRegistado(ass)" tag="li" :to="{path: '/CidadaosRegistados/' + ass.id}">{{ "Cidadao Registado - " + ass.nome }}</router-link>
                    <router-link v-if="isOrganizacao(ass)" tag="li" :to="{path: '/Organizacoes/' + ass.id}">{{ "Organização - " + ass.nome }}</router-link>
                    <router-view/>
                </div>
            </ul>        
        </div>
    </div>
</template>

<script>
export default {
    name: 'RegistoInfoLists',
    props: {
        assuntos: {
            type: Array
        }
    },
    computed: {
        assignKeys(){
            this.assuntos.forEach(element => {
                element.key = assuntos.indexOf(element);
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