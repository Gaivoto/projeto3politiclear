<template>
    <div>
        <div class="divWrapper">
            <h3>Registos:</h3>
            <div v-if="profile.registos">
                <h3 class="subTopic" v-if="showRegistosCriados">Criados:</h3>
                <ul v-if="showRegistosCriados">
                    <router-link tag="li" v-for="reg in profile.registos.criados" v-bind:key="reg.id" :to="{path: '/registos/' + reg.id}">{{ reg.titulo }}</router-link>
                    <router-view/>
                </ul>
                <h3 class="subTopic">Votados:</h3>
                <ul>
                    <router-link tag="li" v-for="reg in profile.registos.votados" v-bind:key="reg.id" :to="{path: '/registos/' + reg.id}">{{ reg.titulo }}</router-link>
                    <router-view/>
                </ul>
                <h3 class="subTopic">Acerca de:</h3>
                <ul>
                    <router-link tag="li" v-for="reg in profile.registos.acerca" v-bind:key="reg.id" :to="{path: '/registos/' + reg.id}">{{ reg.titulo }}</router-link>
                    <router-view/>
                </ul>
            </div>
        </div>
        <div class="divWrapper">
            <h3>Concursos:</h3>
            <div v-if="profile.concursos">
                <h3 class="subTopic" v-if="showOutros">Organizados:</h3>
                <ul v-if="showOutros">
                    <router-link tag="li" v-for="con in profile.concursos.organizados" v-bind:key="con.id" :to="{path: '/concursos/' + con.id}">{{ con.nome }}</router-link>
                    <router-view/>
                </ul>
                <h3 class="subTopic">Participados:</h3>
                <ul>
                    <router-link tag="li" v-for="con in profile.concursos.participados" v-bind:key="con.id" :to="{path: '/concursos/' + con.id}">{{ con.nome }}</router-link>
                    <router-view/>
                </ul>
            </div>
        </div>
        <div class="divWrapper">
            <h3>Contratos:</h3>
            <div v-if="profile.contratos">
                <h3 class="subTopic" v-if="showOutros">Propostos:</h3>
                <ul v-if="showOutros">
                    <router-link tag="li" v-for="con in profile.contratos.propostos" v-bind:key="con.id" :to="{path: '/contratos/' + con.id}">{{ con.nome }}</router-link>
                    <router-view/>
                </ul>
                <h3 class="subTopic">Assinados:</h3>
                <ul>
                    <router-link tag="li" v-for="con in profile.contratos.assinados" v-bind:key="con.id" :to="{path: '/contratos/' + con.id}">{{ con.nome }}</router-link>
                    <router-view/>
                </ul>    
            </div>
        </div>
        <div class="divWrapper">
            <h3>Eventos:</h3>
            <div v-if="profile.eventos">
                <h3 class="subTopic" v-if="showOutros">Organizados:</h3>
                <ul v-if="showOutros">
                    <router-link tag="li" v-for="eve in profile.eventos.organizados" v-bind:key="eve.id" :to="{path: '/eventos/' + eve.id}">{{ eve.nome }}</router-link>
                    <router-view/>
                </ul>
                <h3 class="subTopic">Participados:</h3>
                <ul>
                    <router-link tag="li" v-for="eve in profile.eventos.participados" v-bind:key="eve.id" :to="{path: '/eventos/' + eve.id}">{{ eve.nome }}</router-link>
                    <router-view/>
                </ul>    
            </div>
        </div>
        
        <div class="divWrapper">
            <div v-if="profile.organizacoes && showOrganizacoes">
                <h3>Organizações:</h3>
                <ul>
                    <router-link tag="li" v-for="org in profile.organizacoes" v-bind:key="org.id" :to="{path: '/organizacoes/' + org.id}">{{ org.nome }}</router-link>
                    <router-view/>
                </ul>  
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ProfileList',
    props: {
        profile: {
            type: Object,
            required: true
        }
    },
    computed: {
        showRegistosCriados: function(){
            return this.$store.getters.getUser.info.tipo == "CidadaoCreditado";
        },
        showOrganizacoes: function(){
            return (this.$store.getters.getUser.info.tipo == "CidadaoCreditado" || this.$store.getters.getUser.info.tipo == "Empresario" || this.$store.getters.getUser.info.tipo == "Politico");
        },
        showOutros: function(){
            return (this.$store.getters.getUser.info.tipo == "Empresario" || this.$store.getters.getUser.info.tipo == "Politico");
        }
    }
}
</script>

<style scoped>
</style>