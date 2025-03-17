import bcrypt from 'bcrypt';

/**
 * Utility to generate password hashes for admin setup
 * Run with: npx ts-node src/auth/generateHash.ts YOUR_PASSWORD
 */
async function generateHash() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Please provide a password to hash');
    console.log('Usage: npx ts-node src/auth/generateHash.ts YOUR_PASSWORD');
    process.exit(1);
  }

  const password = args[0];
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('\nPassword Hash:');
    console.log(hash);
    console.log('\nAdd this to your .env file as:');
    console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateHash(); 