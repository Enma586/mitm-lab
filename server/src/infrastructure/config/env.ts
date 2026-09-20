export const env = {
  port: Number.parseInt(process.env.PORT ?? "4000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  // CORS abierto a proposito: cualquier origen puede llamar a la API.
  // Es parte del escenario "app vulnerable" del roadmap, no una buena
  // practica para un backend real.
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};
