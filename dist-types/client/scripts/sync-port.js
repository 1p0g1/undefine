import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiPortFile = path.resolve(__dirname, "../../.api_port");
const clientEnvPath = path.resolve(__dirname, "../.env");
const MAX_RETRIES = 10;
const RETRY_DELAY = 500; // 500ms
async function waitForApiPort() {
    let retries = MAX_RETRIES;
    while (retries > 0) {
        if (fs.existsSync(apiPortFile)) {
            const apiPort = fs.readFileSync(apiPortFile, 'utf-8').trim();
            const envContent = `VITE_API_URL=http://localhost:${apiPort}`;
            fs.writeFileSync(clientEnvPath, envContent);
            console.log(`✅ Updated VITE_API_URL to http://localhost:${apiPort}`);
            return;
        }
        console.log(`⏳ Waiting for API port file... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        retries--;
    }
    console.error("❌ .api_port not found after retries");
    process.exit(1);
}
waitForApiPort();
