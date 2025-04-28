# Type Definition Generation Fix

## Issue
The shared types package was failing to generate the correct type definition files. The build script was checking for `dist/types/index.d.ts` but the file was being generated as `dist/index.d.ts.map` instead.

## Root Cause
1. Misalignment between `package.json` and TypeScript configuration files
2. `declarationMap` setting was generating `.d.ts.map` files instead of `.d.ts` files
3. Output directory configuration was inconsistent

## Solution
1. Updated `tsconfig.prod.json` to disable `declarationMap`:
```diff
- "declarationMap": true,
+ "declarationMap": false,
```

2. Aligned output directory configuration in `tsconfig.json` and `tsconfig.prod.json` to match `package.json` expectations:
- Set `declarationDir` to `dist` to match the `types` field in `package.json`
- Ensured `outDir` and `declarationDir` point to the same location

## Verification
- Build command now succeeds: `npm run build`
- Type definition file is correctly generated at `dist/index.d.ts`
- No more `.d.ts.map` files being generated
- Client code can properly import types from `@undefine/shared-types` 