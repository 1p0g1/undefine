import { createServer } from 'net';
function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        const server = createServer();
        server.listen(startPort, () => {
            const address = server.address();
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
