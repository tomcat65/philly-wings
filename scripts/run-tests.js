#!/usr/bin/env node

/**
 * Test Runner Script
 *
 * Runs all tests with proper setup and teardown
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { runTests } from '../test/admin-menu.test.js';

// Check if emulators are running
function checkEmulators() {
  console.log('🔍 Checking if Firebase emulators are running...');

  return new Promise((resolve) => {
    const checkProcess = spawn('curl', ['-s', 'http://localhost:4000'], { stdio: 'ignore' });

    checkProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Firebase emulators are running');
        resolve(true);
      } else {
        console.log('❌ Firebase emulators are not running');
        resolve(false);
      }
    });

    // Timeout after 2 seconds
    setTimeout(() => {
      checkProcess.kill();
      resolve(false);
    }, 2000);
  });
}

// Start emulators if needed
function startEmulators() {
  console.log('🚀 Starting Firebase emulators...');

  return new Promise((resolve, reject) => {
    const emulatorProcess = spawn('npm', ['run', 'emulators'], {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    let started = false;

    emulatorProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);

      // Check if emulators are ready
      if (output.includes('All emulators ready') || output.includes('View Emulator UI at')) {
        if (!started) {
          started = true;
          console.log('✅ Emulators started successfully');
          setTimeout(() => resolve(emulatorProcess), 2000); // Give it a moment to fully start
        }
      }
    });

    emulatorProcess.stderr.on('data', (data) => {
      console.error('Emulator error:', data.toString());
    });

    emulatorProcess.on('error', (error) => {
      reject(new Error(`Failed to start emulators: ${error.message}`));
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        emulatorProcess.kill();
        reject(new Error('Emulators failed to start within 30 seconds'));
      }
    }, 30000);
  });
}

// Main test execution
async function main() {
  console.log('🧪 Philly Wings Test Runner');
  console.log('============================\n');

  let emulatorProcess = null;
  let success = false;

  try {
    // Check if emulators are already running
    const emulatorsRunning = await checkEmulators();

    if (!emulatorsRunning) {
      console.log('Starting emulators...');
      emulatorProcess = await startEmulators();
    }

    // Wait a moment for emulators to be fully ready
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Run the tests
    console.log('\n🏃 Running integration tests...\n');
    success = await runTests();

  } catch (error) {
    console.error('💥 Test runner failed:', error.message);
    success = false;
  } finally {
    // Clean up: stop emulators if we started them
    if (emulatorProcess) {
      console.log('\n🛑 Stopping emulators...');
      emulatorProcess.kill('SIGTERM');

      // Give it time to clean up
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (success) {
    console.log('\n✅ All tests completed successfully!');
    console.log('🎯 Next steps:');
    console.log('   1. Run migration script: node scripts/fix-menu-data.js');
    console.log('   2. Test admin panel: npm run dev');
    console.log('   3. Open admin: http://localhost:5000/admin/platform-menu.html');
  } else {
    console.log('\n❌ Tests failed. Check the logs above for details.');
  }

  process.exit(success ? 0 : 1);
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Test runner interrupted. Cleaning up...');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test runner terminated. Cleaning up...');
  process.exit(1);
});

// Run the tests
main();