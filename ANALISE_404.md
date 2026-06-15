# Análise de Possíveis Causas de Erro 404 na Vercel

## 🔍 Problemas Identificados

### 1. ❌ **Discrepância no Entry Point do Cliente (CRÍTICO)**
**Localização:** `index.html:11`

```html
<script type="module" src="/src/main.tsx"></script>
```

**Problema:** 
- O arquivo `/src/main.tsx` não existe no projeto
- TanStack Start gerencia automaticamente o entry point via `@lovable.dev/vite-tanstack-config`
- Em produção na Vercel, isso pode causar erro ao carregar o bundle principal do JavaScript

**Solução:**
- Remover a tag `<script>` manual do index.html
- Deixar que TanStack Start injete o script automaticamente durante o build
- Ou usar `<div id="root"></div>` sem referência manual ao arquivo

---

### 2. ⚠️ **Ausência de Rota Catch-All**
**Localização:** `src/routes/` - faltam rotas

**Problema:**
- Há apenas 4 rotas definidas: `/`, `/admin`, `/oferta`, e `__root.tsx`
- Não há uma rota catch-all (`$.tsx`) ou layout router para capturar subrotas
- Isso está correto para o comportamento esperado, mas pode ser o motivo do 404

**Estrutura Atual:**
```
✓ / (index.tsx)
✓ /admin (admin.tsx)
✓ /oferta (oferta.tsx)
✗ /* (nenhuma rota catch-all)
```

**Possível Solução:**
- Se há subrotas esperadas (ex: `/oferta/detalhes`), criar:
  - `oferta/index.tsx` (para `/oferta`)
  - `oferta/$.tsx` (para subrotas de `/oferta`)

---

### 3. 🔧 **Configuração de Build Incompleta para Vercel**
**Localização:** `vite.config.ts`

**Problema:**
```typescript
{
  tanstackStart: {
    server: { entry: "server" }
  }
}
```

- Usa Nitro como bundler (via TanStack Start com `@lovable.dev/vite-tanstack-config`)
- TanStack Start com Nitro gera saída em `.output` (não em `dist/`)
- Vercel pode não estar configurado para servir a saída corretamente

**O que acontece na build:**
1. Vite + Nitro cria servidor em `.output/server/`
2. Assets estáticos em `.output/public/`
3. Vercel precisa saber como rodar este servidor

---

### 4. 📦 **Falta de `vercel.json`**
**Localização:** Não existe na raiz do projeto

**Problema:**
- Sem `vercel.json`, Vercel usa detecção automática
- Pode não saber como servir uma aplicação TanStack Start com Nitro
- Não há configuração de rewrites para SPA routing

**O que deveria ter:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output",
  "framework": "other",
  "functions": {
    "api/**.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

---

### 5. 🌐 **Possível Falta de Rewrite para SPA**
**Localização:** Ausência de configuração de servidor

**Problema:**
- Aplicações SPA precisam redirecionar todas as requisições para `index.html`
- TanStack Start com SSR não precisa disso (renderiza no servidor), MAS pode haver erro se o servidor não está configurado corretamente
- Se o servidor Nitro não está rodando, Vercel tenta servir arquivos estáticos e recebe 404

**Cenário Provável:**
- Build: ✓ Funciona
- Execução: ✗ `.output/server/` não inicia corretamente
- Resultado: Vercel tenta servir `/` como arquivo estático → 404

---

### 6. 🚀 **Falta de Script de Inicialização no `package.json`**
**Localização:** `package.json`

**Problema:**
```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

- Não há script `start` para produção
- Vercel pode não saber como iniciar a aplicação após o build
- Nitro espera ser executado via `node .output/server/index.mjs`

**Solução:**
```json
{
  "start": "node .output/server/index.mjs"
}
```

---

### 7. 📂 **Estrutura de Rotas com Imports Corretos**
**Localização:** `src/routes/__root.tsx` ✅

**Status:** OK
- `notFoundComponent` está corretamente definido
- ErrorComponent existe
- Imports funcionam

**Localização:** `src/router.tsx` ✅

**Status:** OK
- `routeTree` é importado corretamente de `./routeTree.gen`
- QueryClient está configurado
- Contexto é passado corretamente

---

### 8. 🔀 **Configuração de Servidor (server.ts)**
**Localização:** `src/server.ts` ✅

**Status:** OK
- Importa entry point do TanStack Start
- Handles errors corretamente
- Wraps SSR com error boundary

---

## 📋 Resumo de Ações Recomendadas

### Prioridade 1 - Crítico:
1. **Remover/corrigir entry point manual em `index.html`**
   - Deixar TanStack Start gerenciar automaticamente

2. **Criar `vercel.json`**
   - Configurar buildCommand, outputDirectory
   - Especificar que é um projeto Node.js

3. **Adicionar script `start` em `package.json`**
   - `"start": "node .output/server/index.mjs"`

### Prioridade 2 - Importante:
4. **Verificar deployment na Vercel**
   - Revisar logs de build
   - Confirmar que `.output/` é criado
   - Testar localmente: `npm run build && npm start`

5. **Adicionar logs de debug**
   - Verificar se servidor Nitro está iniciando

### Prioridade 3 - Opcional:
6. **Expandir rotas se necessário**
   - Adicionar subrotas conforme necessário
   - Usar convenção `$.tsx` para catch-all se for SPA

---

## 🧪 Como Testar Localmente

```bash
# Build
npm run build

# Simular produção
npm start

# Deve servir na porta 3000 (ou configurada no Nitro)
# Testar rotas:
# http://localhost:3000/
# http://localhost:3000/admin
# http://localhost:3000/oferta
# http://localhost:3000/inexistente (deve retornar 404 page)
```

---

## 📌 Tecnologias Envolvidas
- **TanStack Start** - Framework React meta-framework
- **Nitro** - Server framework (via @lovable.dev/vite-tanstack-config)
- **Vite** - Build tool
- **TanStack Router** - File-based routing
- **@lovable.dev/vite-tanstack-config** - Build configuration abstraction
