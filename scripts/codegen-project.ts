import 'dotenv/config';
import { execSync } from 'child_process';

// Map of project names to their auth files and URLs
const projectConfigs = {
  'mda': {
    authFile: 'auth/user.json',
    urlEnv: 'APP_URL'
  },
  'portal': {
    authFile: 'auth/auth.json', 
    urlEnv: 'PORTAL_URL'
  },
  'public-file': {
    authFile: 'auth/public-file.json',
    urlEnv: 'AZURE_APP_URL'
  }
};

// Get project from command line argument
const project = process.argv[2];

if (!project || !(project in projectConfigs)) {
  console.error('Please specify a valid project: mda, portal, or public-file');
  console.error('Usage: npm run codegen:project <project-name>');
  process.exit(1);
}

const config = projectConfigs[project as keyof typeof projectConfigs];

if (!config) {
  console.error(`Unknown project: ${project}`);
  console.error('Available projects:', Object.keys(projectConfigs).join(', '));
  process.exit(1);
}

const url = process.env[config.urlEnv];
if (!url) {
  console.error(`${config.urlEnv} not found in .env file`);
  process.exit(1);
}

console.log(`Starting codegen for ${project} project with URL: ${url}`);
execSync(`npx playwright codegen --load-storage=${config.authFile} --output=tests/${project}/codegen-test.spec.ts "${url}"`, { 
  stdio: 'inherit' 
});