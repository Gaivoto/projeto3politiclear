<template>
    <div>
        <label>Registos acerca:</label>
        <div v-if="info.registos">
            <ul id="registos">
                <router-link tag="li" v-for="reg in info.registos.acerca" v-bind:key="reg.id" :to="{path: '/registos/' + reg.id}">{{ reg.titulo }}</router-link>
                <router-view/>
            </ul>    
        </div>
        <label>Organizações:</label>
        <div v-if="info.organizacoes">
            <ul id="organizacoes">
                <router-link tag="li" v-for="org in info.organizacoes" v-bind:key="org.id" :to="{path: '/organizacoes/' + org.id}">{{ org.nome }}</router-link>
                <router-view/>
            </ul>    
        </div>
        <label>Concursos:</label>
        <div v-if="info.concursos">
            <ul id="concursos">
                <li>
                    Organizados:
                    <ul>
                        <router-link tag="li" v-for="con in info.concursos.organizados" v-bind:key="con.id" :to="{path: '/concursos/' + con.id}">{{ con.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
                <li>
                    Participados:
                    <ul>
                        <router-link tag="li" v-for="con in info.concursos.participados" v-bind:key="con.id" :to="{path: '/concursos/' + con.id}">{{ con.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
                <li>
                    Vencidos:
                    <ul>
                        <router-link tag="li" v-for="con in info.concursos.vencidos" v-bind:key="con.id" :to="{path: '/concursos/' + con.id}">{{ con.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
            </ul>    
        </div>
        <label>Contratos:</label>
        <div v-if="info.contratos">
            <ul id="contratos">
                <li>
                    Propostos:
                    <ul>
                        <router-link tag="li" v-for="con in info.contratos.propostos" v-bind:key="con.id" :to="{path: '/contratos/' + con.id}">{{ con.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
                <li>
                    Assinados:
                    <ul>
                        <router-link tag="li" v-for="con in info.contratos.assinados" v-bind:key="con.id" :to="{path: '/contratos/' + con.id}">{{ con.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
            </ul>    
        </div>
        <label>Eventos:</label>
        <div v-if="info.eventos">
            <ul id="eventos">
                <li>
                    Organizados:
                    <ul>
                        <router-link tag="li" v-for="eve in info.eventos.organizados" v-bind:key="eve.id" :to="{path: '/eventos/' + eve.id}">{{ eve.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
                <li>
                    Participados:
                    <ul>
                        <router-link tag="li" v-for="eve in info.eventos.participados" v-bind:key="eve.id" :to="{path: '/eventos/' + eve.id}">{{ eve.nome }}</router-link>
                        <router-view/>
                    </ul>
                </li>
            </ul>    
        </div>      
    </div>
</template>

<script>
export default {
    name: 'PoliticoInfoLists',
    props: {
        info: {
            type: Object
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