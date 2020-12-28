import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/registos',
    name: 'Registos',
    component: () => import('../views/Registos.vue')
  },
  {
    path: '/registos/create',
    name: 'CriarRegisto',
    component: () => import('../views/CriarRegisto.vue')
  },
  {
    path: '/registos/:id',
    name: 'Registo',
    component: () => import('../views/Registo.vue')
  },
  {
    path: '/eventos',
    name: 'Eventos',
    component: () => import('../views/Eventos.vue')
  },
  {
    path: '/eventos/create',
    name: 'CriarEvento',
    component: () => import('../views/CriarEvento.vue')
  },
  {
    path: '/eventos/:id',
    name: 'Evento',
    component: () => import('../views/Evento.vue')
  },
  {
    path: '/eventos/:id/edit',
    name: 'AlterarEvento',
    component: () => import('../views/AlterarEvento.vue')
  },
  {
    path: '/concursos',
    name: 'Concursos',
    component: () => import('../views/Concursos.vue')
  },
  {
    path: '/concursos/create',
    name: 'CriarConcurso',
    component: () => import('../views/CriarConcurso.vue')
  },
  {
    path: '/concursos/:id',
    name: 'Concurso',
    component: () => import('../views/Concurso.vue')
  },
  {
    path: '/concursos/:id/edit',
    name: 'AlterarConcurso',
    component: () => import('../views/AlterarConcurso.vue')
  },
  {
    path: '/contratos',
    name: 'Contratos',
    component: () => import('../views/Contratos.vue')
  },
  {
    path: '/contratos/create',
    name: 'CriarContrato',
    component: () => import('../views/CriarContrato.vue')
  },
  {
    path: '/contratos/:id',
    name: 'Contrato',
    component: () => import('../views/Contrato.vue')
  },
  {
    path: '/contratos/:id/edit',
    name: 'AlterarContrato',
    component: () => import('../views/AlterarContrato.vue')
  },
  {
    path: '/politicos',
    name: 'Politicos',
    component: () => import('../views/Politicos.vue')
  },
  {
    path: '/politicos/:id',
    name: 'Politico',
    component: () => import('../views/Politico.vue')
  },
  {
    path: '/empresarios',
    name: 'Empresarios',
    component: () => import('../views/Empresarios.vue')
  },
  {
    path: '/empresarios/:id',
    name: 'Empresario',
    component: () => import('../views/Empresario.vue')
  },
  {
    path: '/organizacoes',
    name: 'Organizacoes',
    component: () => import('../views/Organizacoes.vue')
  },
  {
    path: '/organizacoes/:id',
    name: 'Organizacao',
    component: () => import('../views/Organizacao.vue')
  },
  {
    path: '/cidadaosCreditados',
    name: 'CidadaosCreditados',
    component: () => import('../views/CidadaosCreditados.vue')
  },
  {
    path: '/cidadaosCreditados/:id',
    name: 'CidadaoCreditado',
    component: () => import('../views/CidadaoCreditado.vue')
  },
  {
    path: '/cidadaosRegistados/:id',
    name: 'CidadaoRegistado',
    component: () => import('../views/CidadaoRegistado.vue')
  },
  {
    path: '/perfil/:tipo/:id',
    name: 'Perfil',
    component: () => import('../views/Perfil.vue')
  },
  {
    path: '/areaAdm/users',
    name: 'AreaAdmUsers',
    component: () => import('../views/AreaAdmUsers.vue')
  },
  {
    path: '/areaAdm/orgs',
    name: 'AreaAdmOrgs',
    component: () => import('../views/AreaAdmOrgs.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
