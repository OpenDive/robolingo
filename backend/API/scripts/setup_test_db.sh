#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up test database for the Language Learning API...${NC}"

# Check for SQLite
if ! command -v sqlite3 &> /dev/null; then
    echo -e "${RED}SQLite3 is not installed. Please install it first.${NC}"
    echo "On macOS you can use: brew install sqlite3"
    exit 1
fi

# Create test database directory if it doesn't exist
DBDIR="./test-db"
mkdir -p $DBDIR

echo -e "${GREEN}Test database directory created at $DBDIR${NC}"

# Create an empty SQLite database file for testing if needed
TEST_DB_FILE="$DBDIR/test.sqlite"
if [ -f "$TEST_DB_FILE" ]; then
    echo -e "${YELLOW}Test database file already exists. Do you want to reset it? (y/n)${NC}"
    read -r answer
    if [ "$answer" != "${answer#[Yy]}" ]; then
        rm "$TEST_DB_FILE"
        echo -e "${GREEN}Existing test database removed.${NC}"
    else
        echo -e "${YELLOW}Using existing test database.${NC}"
    fi
fi

# Create a new SQLite database or use existing
if [ ! -f "$TEST_DB_FILE" ]; then
    touch "$TEST_DB_FILE"
    echo -e "${GREEN}Created new test database file at $TEST_DB_FILE${NC}"
fi

# Update .env file with test configuration if it exists
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    # Check if TEST_DB_PATH is already set
    if grep -q "TEST_DB_PATH" "$ENV_FILE"; then
        # Update the existing TEST_DB_PATH
        sed -i '' "s|TEST_DB_PATH=.*|TEST_DB_PATH=$TEST_DB_FILE|g" "$ENV_FILE"
    else
        # Add TEST_DB_PATH if it doesn't exist
        echo "TEST_DB_PATH=$TEST_DB_FILE" >> "$ENV_FILE"
    fi
    echo -e "${GREEN}Updated .env file with test database path${NC}"
else
    # Create a new .env file with test configuration
    echo "TEST_DB_PATH=$TEST_DB_FILE" > "$ENV_FILE"
    echo -e "${GREEN}Created .env file with test database path${NC}"
fi

echo -e "${GREEN}Test database setup complete!${NC}"
echo -e "You can now run tests with: ${YELLOW}npm test${NC}" 