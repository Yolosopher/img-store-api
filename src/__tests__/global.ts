import App from "@/app";
import CONFIG from "@/config";

const app = new App({
  port: CONFIG.port,
  mode: CONFIG.node_env,
  mongo_url: CONFIG.mongo_url,
});

export const server = app.httpServer;

export async function setup() {
  return await app.runDB();
}

export async function teardown() {
  await app.clearTestDB();
  return await app.closeDB();
}
