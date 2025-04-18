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
      "skipLibCheck": true
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

- [ ] Run:
  ```bash
  npx tsc -p tsconfig.server.json
  ```
  and fix **all errors**.
- [ ] Test `npm run build` locally.
- [ ] Remove husky if it's causing deploy issues:
  ```json
  "prepare": ""
  ```
  Or:
  ```json
  "prepare": "test $CI = true || husky install"
  ```

---

### ✅ 6. DEPLOY TO RENDER

- [ ] Push changes to GitHub
- [ ] Redeploy on Render
- [ ] Check logs for remaining build/runtime issues

---

This doc is your battle plan. **Own it. Edit it. Track your progress.**

