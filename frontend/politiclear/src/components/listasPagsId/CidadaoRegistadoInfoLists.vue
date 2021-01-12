<template>
    <div>
        <div class="divWrapper">
            <h3>Registos acerca:</h3>
            <div v-if="info.registos">
                <ul>
                    <router-link tag="li" v-for="reg in info.registos.acerca" v-bind:key="reg.id" :to="{path: '/registos/' + reg.id}">{{ reg.titulo }}</router-link>
                    <router-view/>
                </ul>       
            </div> 
        </div>
        <div class="divWrapper">
            <h3>Concursos:</h3>
            <div v-if="info.concursos">
                <h3 class="subTopic">Participados:</h3>
                <ul>
                    <router-link tag="li" v-for="con in info.concursos.participados" v-bind:key="con.id" :to="{path: '/concursos/' + con.id}">{{ con.nome }}</router-link>
                    <router-view/>
                </ul>
                <h3 class="subTopic">Vencidos:</h3>
                <ul>
                    <router-link tag="li" v-for="con in info.concursos.vencidos" v-bind:key="con.id" :to="{path: '/concursos/' + con.id}">{{ con.nome }}</router-link>
                    <router-view/>
                </ul>
            </div>
        </div>
        <div class="divWrapper">
            <h3>Contratos assinados:</h3>
            <div v-if="info.contratos">
                <ul>
                    <router-link tag="li" v-for="con in info.contratos.assinados" v-bind:key="con.id" :to="{path: '/contratos/' + con.id}">{{ con.nome }}</router-link>
                    <router-view/>
                </ul>       
            </div> 
        </div>
        <div class="divWrapper">
            <h3>Eventos participados:</h3>
            <div v-if="info.eventos">
                <ul>
                    <router-link tag="li" v-for="eve in info.eventos.participados" v-bind:key="eve.id" :to="{path: '/eventos/' + eve.id}">{{ eve.nome }}</router-link>
                    <router-view/>
                </ul>       
            </div> 
        </div>
    </div>
</template>

<script>
export default {
    name: 'CidadaoRegistadoInfoLists',
    props: {
        info: {
            type: Object
        }
    }
}
</script>

<style scoped>
</style>