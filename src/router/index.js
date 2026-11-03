import { createRouter, createWebHistory } from 'vue-router'
import MissoesView from '../views/MissoesView.vue'
import NovaMissaoView from '../views/NovaMissaoView.vue'
import NotasView from '../views/NotasView.vue'
import ForumView from '../views/ForumView.vue'
import RankingView from '../views/RankingView.vue'
import PainelProfessorView from '../views/PainelProfessorView.vue'
import AssistenteView from '../views/AssistenteView.vue'
import LaboratorioView from '../views/LaboratorioView.vue'

/** Enquanto nao existe selecao de curso, toda tela trabalha sobre o curso 1. */
const CURSO_PADRAO = 1

/** Rotulos usados tambem no menu lateral (App.vue) e nos testes de UI. */
export const ITENS_DO_MENU = [
  { titulo: 'Missoes do aluno', caminho: '/missoes', icone: 'mdi-sword-cross', grupo: 'Aprender' },
  { titulo: 'Nova missao (professor)', caminho: '/nova-missao', icone: 'mdi-plus-box', grupo: 'Gestao' },
  { titulo: 'Minhas notas', caminho: '/notas', icone: 'mdi-clipboard-text', grupo: 'Aprender' },
  { titulo: 'Forum', caminho: '/forum', icone: 'mdi-forum', grupo: 'Comunidade' },
  { titulo: 'Ranking da turma', caminho: '/ranking', icone: 'mdi-trophy', grupo: 'Gamificacao' },
  { titulo: 'Painel do professor', caminho: '/painel-professor', icone: 'mdi-chart-box', grupo: 'Gestao' },
  { titulo: 'Assistente IA', caminho: '/assistente', icone: 'mdi-robot-outline', grupo: 'Inovacao', badge: 'IA' },
  { titulo: 'Laboratorio IoT', caminho: '/laboratorio', icone: 'mdi-chip', grupo: 'Inovacao', badge: 'IoT' },
]

const routes = [
  { path: '/', redirect: '/missoes' },
  { path: '/missoes', component: MissoesView, props: { cursoId: CURSO_PADRAO } },
  { path: '/nova-missao', component: NovaMissaoView, props: { cursoId: CURSO_PADRAO } },
  { path: '/notas', component: NotasView, props: { cursoId: CURSO_PADRAO } },
  { path: '/forum', component: ForumView, props: { cursoId: CURSO_PADRAO } },
  { path: '/ranking', component: RankingView, props: { cursoId: CURSO_PADRAO } },
  { path: '/painel-professor', component: PainelProfessorView, props: { cursoId: CURSO_PADRAO } },
  { path: '/assistente', component: AssistenteView, props: { cursoId: CURSO_PADRAO } },
  { path: '/laboratorio', component: LaboratorioView, props: { cursoId: CURSO_PADRAO } },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
