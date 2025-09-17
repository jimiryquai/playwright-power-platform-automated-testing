import 'dotenv/config';
import { execSync } from 'child_process';

const url = process.env.AZURE_APP_URL;
if (!url) {
    console.error('AZURE_APP_URL not found in .env file');
    process.exit(1);
}

console.log(`Starting codegen with URL: ${url}`);
execSync(`npx playwright codegen --load-storage=auth/public-file.json --output=tests/public-file/codegen-test.spec.ts "${url}"`, { 
    stdio: 'inherit' 
});