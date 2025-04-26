import { describe, it, expect, afterEach } from 'vitest';
describe('Debug mode configuration', () => {
    // Store original NODE_ENV value
    const originalNodeEnv = process.env.NODE_ENV;
    // Reset NODE_ENV after each test
    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
        // Clear module cache after each test to allow reimporting with new NODE_ENV
        jest.resetModules();
    });
    it('Debug mode is disabled in production', async () => {
        // Set NODE_ENV to production
        process.env.NODE_ENV = 'production';
        // Reimport the debug module to get the updated value
        const { DEBUG_MODE } = await import('../client/src/config/debug.js');
        // Verify debug mode is disabled
        expect(DEBUG_MODE).toBe(false);
    });
    it('Debug mode is enabled in development', async () => {
        // Set NODE_ENV to development
        process.env.NODE_ENV = 'development';
        // Reimport the debug module to get the updated value
        const { DEBUG_MODE } = await import('../client/src/config/debug.js');
        // Verify debug mode is enabled
        expect(DEBUG_MODE).toBe(true);
    });
    it('Debug config settings follow DEBUG_MODE value', async () => {
        // Set NODE_ENV to development
        process.env.NODE_ENV = 'development';
        // Reimport the debug module to get the updated value
        const { DEBUG_CONFIG } = await import('../client/src/config/debug.js');
        // Verify debug config settings match DEBUG_MODE
        expect(DEBUG_CONFIG.forceShowAllClues).toBe(true);
        expect(DEBUG_CONFIG.showDebugBanner).toBe(true);
        expect(DEBUG_CONFIG.verboseLogging).toBe(true);
        // Set NODE_ENV to production
        process.env.NODE_ENV = 'production';
        // Clear module cache and reimport
        jest.resetModules();
        const { DEBUG_CONFIG: prodConfig } = await import('../client/src/config/debug.js');
        // Verify debug config settings are disabled in production
        expect(prodConfig.forceShowAllClues).toBe(false);
        expect(prodConfig.showDebugBanner).toBe(false);
        expect(prodConfig.verboseLogging).toBe(false);
    });
});
//# sourceMappingURL=debug-mode.test.js.map