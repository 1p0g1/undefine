const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../client/src/vite-env.d.ts');

if (!fs.existsSync(filePath)) {
  console.error(`
❌ ERROR: vite-env.d.ts is missing!
Please create client/src/vite-env.d.ts with the following content:

/// <reference types="vite/client" />
`);
  process.exit(1);
} else {
  console.log('✅ vite-env.d.ts found.');
} 