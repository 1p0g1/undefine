// port-helper.js
import detectPort from "detect-port";

const startPort = 5174;
const endPort = 5183;

(async () => {
  for (let port = startPort; port <= endPort; port++) {
    const _port = await detectPort(port);
    if (_port === port) {
      console.log(port);
      return;
    }
  }
  console.error("❌ No free port found between 5174–5183.");
  process.exit(1);
})(); 