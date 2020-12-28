<template>
    <div>
        <div v-if="profile.registos">
            <label>Registos:</label>
            <ul id="registos">
                <li v-if="showRegistosCriados">
                    Criados:
                    <ul>
                        <router-link tag="li" v-for="reg in profile.registos.criados" v-bind:key="reg.id" :to="{path: '/registos/' + reg.id}">{{ reg.titulo }}</router-link>
                        <router-view/>
                    </ul>
                </li>
                <li>
                    Votados:
                    <ul>
                        <router-link tag="li" v-for="reg in profile.registos.votados" v-bind:key="reg.id" :to="{path: '/registos/' + reg.id}">{{ reg.titulo }}</router-link>
                        <router-view/>
                    </ul>
                </li>
                <li>
                    Acerca de:
                    <ul>
                        <router-link tag="li" v-for="reg in profile.registos.acerca" v-bind:key="reg.id" :to="{path: '/registos/' + reg.id}">{{ reg.titulo }}</router-link>
                        <router-view/>
                    </ul>
                </li>
            </ul>    
        </div>
        <div v-if="profile.organizacoes && showOrganizacoes">
            <label>Organizações:</label>
            <ul id="organizacoes">
                <router-link tag="li" v-for="org in profile.organizacoes" v-bind:key="org.id" :to="{path: '/organizacoes/' + org.id}">{{ org.nome }}</router-link>
                <router-view/>
            </ul>    
        </div>
        <div v-if="profile.associados">
            <label>Associados:</label>
            <ul id="associados">
                <router-link tag="li" v-for="ass in profile.associados" v-bind:key="ass.id" :to="{path: '/' + ass.tipo + 's/' + ass.id}">{{ ass.nome }}</router-link>
                <router-view/>
            </ul>    
        </div>
        <div v-if="profile.concursos">
            <label>Concursos:</label>
            <ul id="concursos">
                <li v-if="showOutros">
                    Organizados:
                    <ul>
                        <router-link tag="li" v-for="con in profile.concursos.organizados" v-bind:key="con.id" :to="{path: '/concursos/' + con.id}">{{ con.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
                <li>
                    Participados:
                    <ul>
                        <router-link tag="li" v-for="con in profile.concursos.participados" v-bind:key="con.id" :to="{path: '/concursos/' + con.id}">{{ con.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
            </ul>    
        </div>
        <div v-if="profile.contratos">
            <label>Contratos:</label>
            <ul id="contratos">
                <li v-if="showOutros">
                    Propostos:
                    <ul>
                        <router-link tag="li" v-for="con in profile.contratos.propostos" v-bind:key="con.id" :to="{path: '/contratos/' + con.id}">{{ con.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
                <li>
                    Assinados:
                    <ul>
                        <router-link tag="li" v-for="con in profile.contratos.assinados" v-bind:key="con.id" :to="{path: '/contratos/' + con.id}">{{ con.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
            </ul>    
        </div>
        <div v-if="profile.eventos">
            <label>Eventos:</label>
            <ul id="eventos">
                <li v-if="showOutros">
                    Organizados:
                    <ul>
                        <router-link tag="li" v-for="eve in profile.eventos.organizados" v-bind:key="eve.id" :to="{path: '/eventos/' + eve.id}">{{ eve.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
                <li>
                    Participados:
                    <ul>
                        <router-link tag="li" v-for="eve in profile.eventos.participados" v-bind:key="eve.id" :to="{path: '/eventos/' + eve.id}">{{ eve.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
            </ul>    
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
ul, label{
    float:left;
    text-align: left;
}
</style>