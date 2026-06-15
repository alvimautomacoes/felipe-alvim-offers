# 📊 Sumário da Pesquisa: Output Directory - TanStack Start

## ✅ PROBLEMA RESOLVIDO

**Antes:** Build gerava output em `dist/` (mesmo com `outDir: ".output"`)  
**Depois:** Build agora gera output correto em `.output/`

## 🔧 Solução Aplicada

**Alteração em `vite.config.ts`:**
```typescript
export default defineConfig({
  // ... outras configs
  nitro: {
    preset: "node-server",  // ← LINHA ADICIONADA
  },
});
```

## 🎯 Por Que Funciona

### O Problema Raiz
- `@lovable.dev/vite-tanstack-config` **desativa Nitro automaticamente** fora do sandbox Lovable
- Sem Nitro, apenas Vite build ocorre (output em `dist/`)
- A opção `outDir: ".output"` aplica apenas ao Vite, não ao Nitro

### A Solução
- Forçar Nitro com `nitro: { preset: "node-server" }`
- Isso ativa build SSR completo (client + server)
- Nitro gera output em `.output/` (seu diretório padrão)

## 📦 Output Agora Contém

```
.output/
├── public/               ← Assets (CSS, JS) para cliente
│   └── assets/
├── server/              ← Node.js server entry point
│   ├── index.mjs        ← Executado por: npm start
│   ├── _ssr/            ← Rotas renderizadas no servidor
│   ├── _libs/           ← Dependências bundled
│   └── _chunks/
└── nitro.json           ← Metadados do build
```

## 🚀 Implicações para Vercel

| Aspecto | Configuração |
|---------|--------------|
| **Build** | `npm run build` |
| **Output** | `.output/` |
| **Start** | `npm start` → `node .output/server/index.mjs` |
| **Tipo** | Full-Stack (SSR) |

## 📚 Opções de Preset Nitro

Se precisar mudar no futuro:

```typescript
// Node.js genérico (ATUAL - Recomendado)
nitro: { preset: "node-server" }

// Vercel específico
nitro: { preset: "vercel" }

// Cloudflare Workers
nitro: { preset: "cloudflare-module" }

// Netlify
nitro: { preset: "netlify" }
```

## ✨ Benefícios

✅ Build agora usa estrutura correta de SSR  
✅ Servidor Node.js pronto para Vercel  
✅ Assets clientseparados em `.output/public/`  
✅ Entry point consistente: `.output/server/index.mjs`  

---

**Arquivos Modificados:**
- `vite.config.ts` — Adicionada config de Nitro
- `PESQUISA_OUTPUT_DIR.md` — Documentação completa (referência técnica)

**Próximos Passos:**
1. ✅ Build local funciona: `npm run build && npm start`
2. 🔄 Fazer push para Vercel: deploy automático
3. ✅ Vercel detecta `.output/` como output directory
