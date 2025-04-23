// TASK: Verify JWT_SECRET has been properly generated and saved in .env.production
import fs from 'fs';
import path from 'path';
// Determine environment based on arguments
const isDev = process.argv.includes('--dev');
const envFile = isDev ? '.env.development' : '.env.production';
const envPath = path.resolve(process.cwd(), envFile);
/**
 * Check if a JWT secret is secure enough
 * @param secret The JWT secret to verify
 * @returns True if the secret is secure enough
 */
function isSecureSecret(secret) {
    // Secret should be at least 32 characters long
    if (secret.length < 32) {
        return false;
    }
    // Check for sufficient complexity (contains mix of characters)
    const hasLetters = /[a-zA-Z]/.test(secret);
    const hasNumbers = /[0-9]/.test(secret);
    const hasSpecial = /[^a-zA-Z0-9]/.test(secret);
    // Hex string from crypto.randomBytes will always have letters and numbers
    // but may not have special chars, so we require at least letters and numbers
    return hasLetters && hasNumbers;
}
/**
 * Verify that JWT_SECRET exists and is secure
 */
function verifyJwtSecret() {
    console.log(`Verifying JWT_SECRET in ${envFile}...`);
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
        console.error(`❌ Error: ${envFile} does not exist.`);
        console.log(`Run 'npm run security:jwt${isDev ? ':dev' : ''}' to generate a secure secret.`);
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    // Extract JWT_SECRET from the file
    const match = envContent.match(/JWT_SECRET=(.+)(\r?\n|$)/);
    if (!match) {
        console.error(`❌ Error: JWT_SECRET not found in ${envFile}.`);
        console.log(`Run 'npm run security:jwt${isDev ? ':dev' : ''}' to generate a secure secret.`);
        process.exit(1);
    }
    const secret = match[1].trim();
    // Verify the secret's security
    if (!isSecureSecret(secret)) {
        console.error(`❌ Error: JWT_SECRET in ${envFile} is not secure enough.`);
        console.log('A secure JWT_SECRET should be at least 32 characters long and contain a mix of characters.');
        console.log(`Run 'npm run security:jwt${isDev ? ':dev' : ''}' to generate a secure secret.`);
        process.exit(1);
    }
    console.log(`✅ JWT_SECRET in ${envFile} is secure.`);
}
// Run the verification
verifyJwtSecret();
