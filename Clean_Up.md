 ## ✅ Un-Define Server Cleanup & Build Fixes

You're now working from a fresh copy of the codebase. This checklist is laser-focused on cleaning up and fixing server-side build issues for Render. Be **ruthless** with deleting legacy code or config that's breaking things. 

---

### 🧼 1. CLEAN UP YOUR `tsconfig` FILES

- [x] **Delete any unused/legacy `tsconfig.*.json` files** that aren't referenced by build scripts.
- [x] In `tsconfig.server.json`, ensure:
  ```json
  {
    "compilerOptions": {
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "esModuleInterop": true,
      "target": "ES2022",
      "jsx": "react-jsx",
      "baseUrl": ".",
      "paths": {
        "@shared/*": ["packages/shared-types/src/*"]
      },
      "outDir": "dist-server",
      "skipLibCheck": true,
      "types": ["node", "react", "react-dom"]
    },
    "include": ["src"],
    "exclude": ["client", "tests", "**/*.test.*"]
  }
  ```

---

### 🪓 2. REMOVE BROKEN OR UNNECESSARY FILES

- [x] Delete any broken/unused test files in `src/tests/`
- [x] Remove any `db.client`, `insertWords`, or `getTopStreaks` logic that doesn't match current `DatabaseClient` types
- [x] Remove or rename unused `.js` files that are throwing extension resolution errors
- [x] If any local import paths are broken (e.g. `@shared/types`), either:
  - Fixed the path in `tsconfig` - Confirmed src/tsconfig.server.json has correct paths
  - Replaced problematic package imports like `@reversedefine/shared-types` with local imports

---

### 🧠 3. REPAIR THE `MockClient`

- [x] Implement missing methods on `MockClient` to satisfy the interface:
  ```ts
  async getNextHint(): Promise<string> {
    return 'mock hint';
  }

  async submitScore(): Promise<void> {
    return;
  }
  ```
- [x] Standardise property naming to match `WordEntry` and `UserStats`
  - e.g. `timesUsed` → `times_used`

---

### 🔁 4. FIX ALL JSX/TSX ISSUES IN CLIENT

- [x] Ensure all `.tsx` files explicitly import `React`
- [x] Add missing types to function parameters (e.g. `e: React.ChangeEvent<HTMLInputElement>`) 
- [x] Install required type packages:
  ```bash
  npm i -D @types/react @types/react-dom @types/cors @types/node-fetch
  ```

---

### 🚦 5. SANITY CHECK BEFORE RE-DEPLOY

- [x] Run:
  ```bash
  npx tsc -p tsconfig.server.json
  ```
  and fix **all errors**.
- [x] Test `npm run build` locally.
- [x] Fix React type issues:
  - Added `/// <reference types="react" />` to `src/config/types.ts`
  - Added explicit `"types": ["node", "react", "react-dom"]` to `tsconfig.server.json`
  - Verified React types are needed for `React.Dispatch<GameAction>` in the server code
- [x] Fix package script issues:
  - Updated prepare script to use proper shell syntax: `"prepare": "[ \"$CI\" = \"true\" ] || exit 0"`

---

### ✅ 6. DEPLOY TO RENDER

- [x] Push changes to GitHub
- [x] Simplified Render build command to prevent redundant builds:
  ```yaml
  buildCommand: npm install && npm run build
  ```
- [ ] Redeploy on Render
- [ ] Check logs for remaining build/runtime issues

---

This doc is your battle plan. **Own it. Edit it. Track your progress.**

