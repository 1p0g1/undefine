// TASK: Securely generate a JWT_SECRET and write it to `.env.production` if it's not already defined.
// 1. Generate a 256-bit JWT_SECRET using crypto
// 2. Check if `.env.production` already includes JWT_SECRET
// 3. If not, append it to the end of the file
// 4. Ensure the secret is never printed or logged
// 5. Handle both dev & prod fallback cases for safety
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
// Determine environment based on arguments
const isDev = process.argv.includes('--dev');
const envFile = isDev ? '.env.development' : '.env.production';
const envPath = path.resolve(process.cwd(), envFile);
/**
 * Generate a secure random string for JWT secret
 * @returns A 64-character hexadecimal string
 */
function generateSecureJwtSecret() {
    return crypto.randomBytes(32).toString('hex');
}
/**
 * Check if JWT_SECRET exists in .env file, if not add it
 */
function ensureJwtSecret() {
    console.log(`Checking for JWT_SECRET in ${envFile}...`);
    let envContent = '';
    // Check if .env file exists
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }
    else {
        console.log(`${envFile} does not exist. Creating it now.`);
    }
    // Check if JWT_SECRET already exists
    if (envContent.includes('JWT_SECRET=')) {
        console.log('JWT_SECRET already exists in the .env file.');
        return;
    }
    // Generate a new JWT secret
    const jwtSecret = generateSecureJwtSecret();
    const newLine = envContent.length > 0 && !envContent.endsWith('\n') ? '\n' : '';
    const newEnvContent = `${envContent}${newLine}JWT_SECRET=${jwtSecret}\n`;
    // Write the updated content back to the .env file
    fs.writeFileSync(envPath, newEnvContent);
    console.log(`JWT_SECRET has been added to ${envFile}.`);
}
// Run the script
ensureJwtSecret();
console.log('JWT secret operation completed successfully.');
