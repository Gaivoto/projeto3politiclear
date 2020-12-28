<template>
    <div>
        <label>Registos acerca:</label>
        <div v-if="info.registos">
            <ul id="contratos">
                <router-link tag="li" v-for="reg in info.registos.acerca" v-bind:key="reg.id" :to="{path: '/registos/' + reg.id}">{{ reg.titulo }}</router-link>
                <router-view/>
            </ul>       
        </div> 
        <div v-if="info.concursos">
            <label>Concursos:</label>
            <ul id="concursos">
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
        <label>Contratos assinados:</label>
        <div v-if="info.contratos">
            <ul id="contratos">
                <router-link tag="li" v-for="con in info.contratos.assinados" v-bind:key="con.id" :to="{path: '/contratos/' + con.id}">{{ con.nome }}</router-link>
                <router-view/>
            </ul>       
        </div> 
        <label>Eventos participados:</label>
        <div v-if="info.eventos">
            <ul id="eventos">
                <router-link tag="li" v-for="eve in info.eventos.participados" v-bind:key="eve.id" :to="{path: '/eventos/' + eve.id}">{{ eve.nome }}</router-link>
                <router-view/>
            </ul>       
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
ul, label{
    float:left;
    text-align: left;
}
</style>