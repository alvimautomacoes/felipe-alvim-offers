# Pesquisa: Configuração de Output Directory - Vite/TanStack Start

## 🔴 Problema Original
O build do Vite estava gerando output em `dist/` em vez de `.output/`, mesmo após adicionar `outDir: ".output"` no `vite.config.ts`.

## 🔍 Investigação e Descobertas

### 1. Como @lovable.dev/vite-tanstack-config Configura o Output

O plugin `@lovable.dev/vite-tanstack-config` implementa lógica condicional:

**Fora de contexto Lovable (e.g., build local):**
- Nitro é **pulado automaticamente**
- Apenas Vite build é executado (gera `dist/`)
- Mensagem: `"No Lovable context detected — skipping nitro deploy plugin"`

**Dentro de contexto Lovable (sandbox/produção):**
- Nitro é **forçado** com preset `cloudflare-module`
- Output: `dist/` (conforme linha 372 do código-fonte)
- Estrutura: `dist/`, `dist/server/`, `dist/client/`

### 2. Configuração Nitro via TanStack Start

O arquivo `node_modules/@lovable.dev/vite-tanstack-config/dist/index.d.ts` revela as opções:

```typescript
nitro?: true | {
    preset?: string;
    output?: {
        dir?: string;
        publicDir?: string;
        serverDir?: string;
    };
    cloudflare?: { ... };
} | false;
```

**Três modos:**
1. `nitro: undefined` (padrão) → Auto-detect Lovable context
2. `nitro: true` → Força Nitro com `defaultPreset: "cloudflare-module"`
3. `nitro: { preset: "..." }` → Força Nitro com preset específico

### 3. Impacto da Opção `nitro: true`

Adicionando `nitro: true` ao vite.config.ts:
- ✅ Força Nitro a rodar fora do sandbox
- ✅ Ativa build SSR completo (client + server)
- ⚠️ Usa preset padrão `cloudflare-module` (não ideal para Vercel)

### 4. Configurações Nitro Alternativas

Para Vercel, opções melhores de preset:

```typescript
// Recomendado para Node.js genérico (Vercel, VPS)
nitro: { preset: "node-server" }

// Alternativa para Vercel específico
nitro: { preset: "vercel" }

// Para Cloudflare Workers
nitro: { preset: "cloudflare-module" }

// Para Netlify
nitro: { preset: "netlify" }
```

### 5. Estrutura de Output Final

Com `nitro: { preset: "node-server" }`:

```
.output/
├── public/                    # Assets de cliente (CSS, JS)
│   └── assets/
├── server/                    # Entry point Node.js
│   ├── index.mjs             # ← Principal (npm start)
│   ├── _ssr/                 # Rotas SSR bundled
│   ├── _libs/                # Dependências compartilhadas
│   └── _chunks/              # Assets internos
└── nitro.json                # Metadados do build
```

**Arquivo Principal:** `.output/server/index.mjs`

## ✅ Solução Implementada

### Mudança em vite.config.ts:

```typescript
// ANTES
export default defineConfig({
  build: {
    outDir: ".output",
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});

// DEPOIS
export default defineConfig({
  build: {
    outDir: ".output",
  },
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",  // ← ADICIONADO
  },
});
```

### Resultado:

```bash
$ npm run build

✓ .output/public/assets/...  (client build OK)
✓ .output/server/index.mjs   (server build OK)
✓ Built in 5.86s
✓ Generated .output/nitro.json
```

## 📋 Verificação Pós-Implementação

```bash
# ✅ Verificar estrutura
ls -la .output/
ls -la .output/server/

# ✅ Verificar se pode iniciar
npm run build && npm start
# Servidor deve estar disponível em http://localhost:3000
```

## 🎯 Implicações para Vercel

1. **Build Command:** `npm run build`
   - Gera `.output/public/` (assets) + `.output/server/` (Node.js)

2. **Output Directory:** `.output`
   - Vercel detecta automaticamente via `vercel.json` ou padrão

3. **Start Command:** `node .output/server/index.mjs`
   - Já configurado em `package.json`: `"start": "node .output/server/index.mjs"`

4. **Deployment Workflow:**
   ```
   Build Phase: npm run build
   ↓
   Output: .output/
   ↓
   Runtime: npm start
   ↓
   Server: Node.js + TanStack Start SSR
   ```

## 📚 Referências de Código Encontradas

**Arquivo:** `node_modules/@lovable.dev/vite-tanstack-config/dist/index.js`

Linhas relevantes:
- 368: `const userNitroOpts = typeof options.nitro === "object" && options.nitro ? options.nitro : {};`
- 372: `nitroOpts.output = { dir: "dist", serverDir: "dist/server", publicDir: "dist/client" };`
- 379: `internalPlugins.push(nitro(nitroOpts));`

---

**Data:** 15/06/2026  
**Status:** ✅ Pesquisa Completa e Solução Aplicada
