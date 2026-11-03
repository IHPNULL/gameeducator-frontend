import { describe, it, expect } from 'vitest'
import router, { ITENS_DO_MENU } from '../../src/router/index.js'

describe('router', () => {
  it('contem todos os itens de menu necessarios para navegacao e testes', () => {
    expect(ITENS_DO_MENU).toBeDefined()
    expect(ITENS_DO_MENU.length).toBeGreaterThanOrEqual(6)

    const titulos = ITENS_DO_MENU.map((item) => item.titulo)
    expect(titulos).toContain('Missoes do aluno')
    expect(titulos).toContain('Nova missao (professor)')
    expect(titulos).toContain('Minhas notas')
    expect(titulos).toContain('Forum')
    expect(titulos).toContain('Ranking da turma')
    expect(titulos).toContain('Painel do professor')
    expect(titulos).toContain('Assistente IA')
    expect(titulos).toContain('Laboratorio IoT')
  })

  it('redireciona a raiz / para /missoes', async () => {
    await router.push('/')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/missoes')
  })

  it('permite navegar para todas as rotas configuradas', async () => {
    for (const item of ITENS_DO_MENU) {
      await router.push(item.caminho)
      expect(router.currentRoute.value.path).toBe(item.caminho)
    }
  })
})
