import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import server.js which boots on port 5000
import('../server.js').then(() => {
  console.log('🚀 Server started, waiting 1s for connection stability...');

  setTimeout(() => {
    const testProcess = fork(path.resolve(__dirname, '../tests_e2e.cjs'), [], {
      stdio: 'inherit',
    });

    testProcess.on('exit', (code) => {
      console.log(`\n🏁 Test suite completed with exit code: ${code}`);
      process.exit(code || 0);
    });
  }, 1000);
});
