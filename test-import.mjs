// Test if renderer can import SSR handler
try {
  const mod = await import("./.output/server/_chunks/renderer-template.mjs");
  console.log("Módulo carregado:", Object.keys(mod));
  console.log("Default export:", typeof mod.default);
} catch (error) {
  console.error("Erro ao carregar:", error.message);
}
