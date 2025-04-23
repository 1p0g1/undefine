import fs from 'fs';
import path from 'path';
import readline from 'readline';
// Paths to environment files
const devEnvPath = path.resolve(process.cwd(), '.env.development');
const prodEnvPath = path.resolve(process.cwd(), '.env.production');
/**
 * Extract JWT_SECRET from an environment file
 * @param filePath Path to the environment file
 * @returns The JWT secret if found, otherwise null
 */
function extractJwtSecret(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/JWT_SECRET=(.+)(\r?\n|$)/);
    return match ? match[1].trim() : null;
}
/**
 * Update JWT_SECRET in the target environment file
 * @param targetPath Path to the target environment file
 * @param secret JWT secret to save
 */
function updateJwtSecret(targetPath, secret) {
    // Create file if it doesn't exist
    if (!fs.existsSync(targetPath)) {
        fs.writeFileSync(targetPath, `JWT_SECRET=${secret}\n`, 'utf8');
        console.log(`Created ${targetPath} with JWT_SECRET`);
        return;
    }
    // Update existing file
    let content = fs.readFileSync(targetPath, 'utf8');
    const regex = /JWT_SECRET=(.+)(\r?\n|$)/;
    if (content.match(regex)) {
        // Replace existing JWT_SECRET
        content = content.replace(regex, `JWT_SECRET=${secret}$2`);
    }
    else {
        // Add JWT_SECRET at the end of file
        content = content.trimEnd() + (content.endsWith('\n') ? '' : '\n') + `JWT_SECRET=${secret}\n`;
    }
    fs.writeFileSync(targetPath, content, 'utf8');
}
/**
 * Get confirmation from the user
 * @param question Question to ask
 * @returns Promise resolving to boolean (true if confirmed)
 */
function confirm(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => {
        rl.question(`${question} (y/n): `, answer => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}
/**
 * Deploy JWT secret from development to production environment
 */
async function deployJwtSecret() {
    console.log('JWT Secret Deployment Tool');
    console.log('==========================');
    // Check dev environment file
    const devSecret = extractJwtSecret(devEnvPath);
    if (!devSecret) {
        console.error(`❌ Error: No JWT_SECRET found in ${devEnvPath}`);
        console.log('Run "npm run security:jwt:dev" to generate a development JWT secret first.');
        process.exit(1);
    }
    // Check prod environment file
    const prodSecret = extractJwtSecret(prodEnvPath);
    if (prodSecret) {
        console.log(`⚠️  JWT_SECRET already exists in ${prodEnvPath}`);
        const shouldOverwrite = await confirm('Do you want to overwrite the existing production secret?');
        if (!shouldOverwrite) {
            console.log('Operation cancelled.');
            process.exit(0);
        }
    }
    // Confirm deployment
    console.log('\nReady to deploy JWT_SECRET from development to production environment.');
    console.log(`Source: ${devEnvPath}`);
    console.log(`Target: ${prodEnvPath}`);
    console.log(`Secret: ${devSecret.substring(0, 4)}...${devSecret.substring(devSecret.length - 4)}`);
    const isConfirmed = await confirm('Proceed with deployment?');
    if (!isConfirmed) {
        console.log('Deployment cancelled.');
        process.exit(0);
    }
    // Deploy the secret
    updateJwtSecret(prodEnvPath, devSecret);
    console.log('✅ JWT_SECRET successfully deployed to production environment.');
}
// Run the deployment
deployJwtSecret().catch(error => {
    console.error('Error during deployment:', error);
    process.exit(1);
});
