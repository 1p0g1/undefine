import { createServer } from 'net';
import type { AddressInfo } from 'net';

function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(startPort, () => {
      const address = server.address() as AddressInfo;
      server.close(() => resolve(address.port));
    });
    
    server.on('error', () => {
      // Port is in use, try the next one
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

// Start looking from port 3000
findAvailablePort(3000).then(port => {
  console.log(port);
}); 