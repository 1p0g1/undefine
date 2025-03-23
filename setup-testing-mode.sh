#!/bin/bash

# Script to set up environment variables for early user testing

# Create or modify .env file
if [ -f .env ]; then
  echo "Updating existing .env file..."
else
  echo "Creating new .env file..."
  touch .env
fi

# Enable testing mode
grep -q "TESTING_MODE" .env
if [ $? -eq 0 ]; then
  # Update existing TESTING_MODE
  sed -i.bak 's/TESTING_MODE=.*/TESTING_MODE=true/' .env
else
  # Add TESTING_MODE
  echo "TESTING_MODE=true" >> .env
fi

# Disable leaderboard
grep -q "DISABLE_LEADERBOARD" .env
if [ $? -eq 0 ]; then
  # Update existing DISABLE_LEADERBOARD
  sed -i.bak 's/DISABLE_LEADERBOARD=.*/DISABLE_LEADERBOARD=true/' .env
else
  # Add DISABLE_LEADERBOARD
  echo "DISABLE_LEADERBOARD=true" >> .env
fi

echo "Testing mode setup complete!"
echo "Environment settings:"
echo "- TESTING_MODE=true"
echo "- DISABLE_LEADERBOARD=true"
echo ""
echo "Changes will take effect on server restart."
echo "Run 'npm run debug:dev' to start the server in testing mode." 