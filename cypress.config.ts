/* eslint-disable no-console */
import path from 'path';
import net from 'net';
import { spawn, ChildProcess } from 'child_process';
import { defineConfig } from 'cypress';
import { removeDirectory } from 'cypress-delete-downloads-folder';
import websocketTasks from './cypress/support/utils/webSocket-utils';

// Required for env vars to be available in cypress
require('dotenv').config();

/**
 * VARIABLES
 */
const hasCoverage = (process.env.TEST_INSTRUMENT === 'true') || false; // Add coverage if instrumented
const skipSetup = process.env.TEST_SKIP?.includes('setup');
const baseUrl = (process.env.TEST_BASE_URL || 'https://localhost:8005').replace(/\/$/, '');
const DEFAULT_USERNAME = 'admin';
const username = process.env.TEST_USERNAME || DEFAULT_USERNAME;
const apiUrl = process.env.API || (baseUrl.endsWith('/dashboard') ? baseUrl.split('/').slice(0, -1).join('/') : baseUrl);

/**
 * LOGS:
 * Summary of the environment variables that we have detected (or are going ot use)
 * We won't show any passwords
 */
console.log('E2E Test Configuration');
console.log('');
console.log(`    Username: ${ username }`);

if (!process.env.CATTLE_BOOTSTRAP_PASSWORD && !process.env.TEST_PASSWORD) {
  console.log(' ❌ You must provide either CATTLE_BOOTSTRAP_PASSWORD or TEST_PASSWORD');
}
if (process.env.CATTLE_BOOTSTRAP_PASSWORD && process.env.TEST_PASSWORD) {
  console.log(' ❗ If both CATTLE_BOOTSTRAP_PASSWORD and TEST_PASSWORD are provided, the first will be used');
}
if (!skipSetup && !process.env.CATTLE_BOOTSTRAP_PASSWORD) {
  console.log(' ❌ You must provide CATTLE_BOOTSTRAP_PASSWORD when running setup tests');
}
if (skipSetup && !process.env.TEST_PASSWORD) {
  console.log(' ❌ You must provide TEST_PASSWORD when running the tests without the setup tests');
}

console.log(`    Setup tests will ${ skipSetup ? 'NOT' : '' } be run`);
console.log(`    Dashboard URL: ${ baseUrl }`);
console.log(`    Rancher API URL: ${ apiUrl }`);

// Check API - sometimes in dev, you might have API set to a different system to the base url - this won't work
// as the login cookie will be for the base url and any API requests will fail as not authenticated
if (apiUrl && !baseUrl.startsWith(apiUrl)) {
  console.log('\n ❗ API variable is different to TEST_BASE_URL - tests may fail due to authentication issues');
}

function waitForMockAgentPort(port: number, host = 'localhost', timeout = 10000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const deadline = Date.now() + timeout;

    (function check() {
      const s = net.createConnection({
        port,
        host
      }, () => {
        s.end();
        resolve();
      });

      s.on('error', () => {
        if (Date.now() > deadline) {
          return reject(new Error(`timeout waiting for ${ host }:${ port }`));
        }
        setTimeout(check, 100);
      });
    })();
  });
}

async function spawnMockAgent(on: Cypress.PluginEvents) {
  let mockProc: ChildProcess | null = null;
  const mockPort = Number(process.env.MOCK_AGENT_PORT || 8000);
  const scriptDir = path.resolve(__dirname, 'mock-agent');

  async function startMockAgent() {
    if (mockProc) {
      return;
    }

    // Run `yarn mock:agent:start`
    mockProc = spawn('yarn', ['mock:agent:start'], {
      cwd:   scriptDir,
      env:   {
        ...process.env,
        MOCK_AGENT_PORT: String(mockPort)
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    mockProc.stdout?.on('data', (d) => {
      if (d?.includes('npx')) {
        process.stdout.write(`\n    [mock agent] pid: ${ (mockProc as any).pid }\n`);
      } else {
        process.stdout.write(`    ${ d }`);
      }
    });
    mockProc.stderr?.on('data', (d) => process.stderr.write(`     [err] ${ d }`));
  }

  try {
    await startMockAgent();
    await waitForMockAgentPort(mockPort, 'localhost', 8000);
    console.log(`    [mock agent] Ready`);
  } catch (error) {
    console.error('    [mock agent] failed to start:', error);
  } finally {
    console.log('');
  }

  on('after:run', async() => {
    if (mockProc && !mockProc.killed) {
      mockProc.kill();
      mockProc = null;
    }
  });
  process.on('exit', () => {
    if (mockProc && !mockProc.killed) {
      mockProc.kill();
    }
  });
}

export default defineConfig({
  projectId:             process.env.TEST_PROJECT_ID,
  defaultCommandTimeout: process.env.TEST_TIMEOUT ? +process.env.TEST_TIMEOUT : 10000,
  trashAssetsBeforeRuns: true,
  chromeWebSecurity:     false,
  retries:               {
    runMode:  2,
    openMode: 0
  },
  videoCompression:    15,
  videoUploadOnPasses: false,
  env:                 {
    grepFilterSpecs:  true,
    grepOmitFiltered: true,
    baseUrl,
    coverage:         hasCoverage,
    codeCoverage:     {
      exclude: [
        'cypress/**/*.*',
        '**/__tests__/**/*.*',
        '**/__mocks__/**/*.*',
        '**/shell/scripts/**/*.*',
      ],
      include: [
        'shell/**/*.{vue,ts,js}',
      ]
    },
    api:                 apiUrl,
    username,
    password:            process.env.CATTLE_BOOTSTRAP_PASSWORD || process.env.TEST_PASSWORD,
    bootstrapPassword:   process.env.CATTLE_BOOTSTRAP_PASSWORD,
    grepTags:            process.env.GREP_TAGS,
    VAI_ENABLED:         process.env.VAI_ENABLED,
    accessibility:       !!process.env.TEST_A11Y, // Are we running accessibility tests?
    a11yFolder:          path.join('.', 'cypress', 'accessibility'),
    mockAgentApi:        'http://localhost:8000',
  },
  e2e: {
    fixturesFolder:               'cypress/e2e/blueprints',
    experimentalSessionAndOrigin: true,
    specPattern:                  'cypress/e2e/tests/**/*.spec.ts',
    baseUrl,
    async setupNodeEvents(on, config) {
      // await spawnMockAgent(on);

      // For more info: https://docs.cypress.io/guides/tooling/code-coverage
      require('@cypress/code-coverage/task')(on, config);
      require('@cypress/grep/src/plugin')(config);
      // For more info: https://www.npmjs.com/package/cypress-delete-downloads-folder

      // Load Accessibility plugin if configured
      if (process.env.TEST_A11Y) {
        require('./cypress/support/plugins/accessibility').default(on, config);
      }

      on('task', { removeDirectory });
      websocketTasks(on, config);

      require('cypress-terminal-report/src/installLogsPrinter')(on, {
        outputRoot:           `${ config.projectRoot }/browser-logs/`,
        outputTarget:         { 'out.html': 'html' },
        logToFilesOnAfterRun: true,
        printLogsToConsole:   'never',
        // printLogsToFile:      'always', // default prints on failures
      });

      return config;
    }
  }
});
