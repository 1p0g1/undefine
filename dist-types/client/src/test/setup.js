import '@testing-library/jest-dom';
import { expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers || {});
// Set up userEvent for all tests
beforeEach(() => {
    // Mock userEvent.setup() return value to support the v14 API
    vi.mock('@testing-library/user-event', async () => {
        const actual = await vi.importActual('@testing-library/user-event');
        return {
            ...actual,
            default: {
                setup: () => ({
                    click: vi.fn().mockResolvedValue(undefined),
                    type: vi.fn().mockResolvedValue(undefined),
                    clear: vi.fn().mockResolvedValue(undefined),
                    keyboard: vi.fn().mockResolvedValue(undefined),
                    selectOptions: vi.fn().mockResolvedValue(undefined),
                    dblClick: vi.fn().mockResolvedValue(undefined),
                    hover: vi.fn().mockResolvedValue(undefined),
                    tab: vi.fn().mockResolvedValue(undefined),
                    paste: vi.fn().mockResolvedValue(undefined),
                    upload: vi.fn().mockResolvedValue(undefined),
                    // Add other methods as needed
                }),
            },
        };
    });
});
// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});
