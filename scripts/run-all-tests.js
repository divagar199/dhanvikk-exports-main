#!/usr/bin/env node

/**
 * Dhanvikk Blooms & Exports - Master Unified Test Runner
 * Executes test suites across:
 * 1. Backend REST API (Razorpay, Orders, Auth, Health, Catalog)
 * 2. Mobile App (Store, Currency, Address Isolation, API Resolvers)
 * 3. Web Frontend (Cart, Currencies, Error Mapping, Addresses)
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const testSuites = [
  {
    name: 'Backend REST API Suite',
    file: 'backend/tests/api.test.js',
    description: 'Health, Razorpay 401 prevention, Orders, Auth addresses, Products',
  },
  {
    name: 'Mobile App Suite',
    file: 'mobile/tests/mobile.test.js',
    description: 'API URL resolver, Zustand cart/wishlist, currency conversions, address safety',
  },
  {
    name: 'Web Frontend Suite',
    file: 'frontend/tests/frontend.test.js',
    description: 'Cart reducer, Razorpay subunits, error transformers, address isolation',
  },
];

console.log('\n=============================================================');
console.log('🌸  DHANVIKK BLOOMS & EXPORTS - AUTOMATED TEST SUITE RUNNER');
console.log('=============================================================\n');

let totalPassed = 0;
let totalFailed = 0;
const results = [];

async function runSuite(suite) {
  console.log(`▶ Running [${suite.name}] (${suite.description})...`);
  const startTime = Date.now();

  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ['--test', path.join(rootDir, suite.file)],
      {
        cwd: rootDir,
        env: { ...process.env, NODE_ENV: 'test' },
        stdio: 'inherit',
      }
    );

    child.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const passed = code === 0;
      if (passed) {
        totalPassed++;
      } else {
        totalFailed++;
      }
      results.push({ name: suite.name, passed, duration });
      console.log(`\n-------------------------------------------------------------\n`);
      resolve();
    });
  });
}

for (const suite of testSuites) {
  await runSuite(suite);
}

console.log('=============================================================');
console.log('📊  TEST SUMMARY REPORT');
console.log('=============================================================');
for (const res of results) {
  const icon = res.passed ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${icon.padEnd(8)} | ${res.name.padEnd(30)} | (${res.duration}s)`);
}
console.log('=============================================================');
console.log(`Total Suites: ${results.length} | Passed: ${totalPassed} | Failed: ${totalFailed}`);

if (totalFailed > 0) {
  console.log('\n❌ Some test suites failed.');
  process.exit(1);
} else {
  console.log('\n🎉 ALL TEST SUITES PASSED CLEANLY!\n');
  process.exit(0);
}
