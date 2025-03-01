#!/bin/bash

# MySQL Database Setup Script for macOS
# This script creates development, test, and production databases
# as specified in the configuration.

# Configuration variables
DB_USER="root"
DB_PASSWORD="OpenDive2025!"
DB_HOST="127.0.0.1"
DEV_DB="database_development"
TEST_DB="database_test"
PROD_DB="database_production"

# Text formatting for console output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to print a formatted header
print_header() {
    echo -e "\n${YELLOW}=== $1 ===${NC}\n"
}

# Function to check if a database exists
database_exists() {
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "SHOW DATABASES LIKE '$1';" | grep -q "$1"
    return $?
}

# Check if MySQL is installed and running
print_header "Checking MySQL installation"
if ! command -v mysql > /dev/null; then
    echo -e "${RED}MySQL is not installed. Please install MySQL first.${NC}"
    echo "You can install it using Homebrew: brew install mysql"
    exit 1
fi

# Check if MySQL service is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo -e "${YELLOW}MySQL service doesn't appear to be running.${NC}"
    echo "Starting MySQL service..."
    
    # Try different methods to start MySQL (depending on how it was installed)
    if command -v brew > /dev/null && brew services list | grep -q mysql; then
        brew services start mysql
    elif [ -f /usr/local/opt/mysql/bin/mysqld_safe ]; then
        /usr/local/opt/mysql/bin/mysqld_safe --datadir=/usr/local/var/mysql &
    elif [ -f /usr/local/mysql/bin/mysqld_safe ]; then
        /usr/local/mysql/bin/mysqld_safe &
    else
        echo -e "${RED}Unable to start MySQL service automatically.${NC}"
        echo "Please start it manually and then run this script again."
        exit 1
    fi
    
    # Wait for MySQL to start
    echo "Waiting for MySQL to start..."
    sleep 5
fi

# Test MySQL connection
print_header "Testing MySQL connection"
if mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "SELECT 'Connection successful!';" > /dev/null 2>&1; then
    echo -e "${GREEN}Successfully connected to MySQL server.${NC}"
else
    echo -e "${RED}Failed to connect to MySQL server.${NC}"
    echo "Please check your credentials and ensure MySQL is running."
    exit 1
fi

# Create databases
print_header "Creating databases"

# Create development database
if database_exists "$DEV_DB"; then
    echo -e "${YELLOW}Development database '$DEV_DB' already exists.${NC}"
else
    echo "Creating development database: $DEV_DB"
    if mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "CREATE DATABASE $DEV_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"; then
        echo -e "${GREEN}Successfully created development database.${NC}"
    else
        echo -e "${RED}Failed to create development database.${NC}"
    fi
fi

# Create test database
if database_exists "$TEST_DB"; then
    echo -e "${YELLOW}Test database '$TEST_DB' already exists.${NC}"
else
    echo "Creating test database: $TEST_DB"
    if mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "CREATE DATABASE $TEST_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"; then
        echo -e "${GREEN}Successfully created test database.${NC}"
    else
        echo -e "${RED}Failed to create test database.${NC}"
    fi
fi

# Create production database
if database_exists "$PROD_DB"; then
    echo -e "${YELLOW}Production database '$PROD_DB' already exists.${NC}"
else
    echo "Creating production database: $PROD_DB"
    if mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "CREATE DATABASE $PROD_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"; then
        echo -e "${GREEN}Successfully created production database.${NC}"
    else
        echo -e "${RED}Failed to create production database.${NC}"
    fi
fi

# Generate database.json configuration file
print_header "Generating database configuration"
cat > database.json << EOF
{
  "development": {
    "username": "$DB_USER",
    "password": "$DB_PASSWORD",
    "database": "$DEV_DB",
    "host": "$DB_HOST",
    "dialect": "mysql"
  },
  "test": {
    "username": "$DB_USER",
    "password": "$DB_PASSWORD",
    "database": "$TEST_DB",
    "host": "$DB_HOST",
    "dialect": "mysql"
  },
  "production": {
    "username": "$DB_USER",
    "password": "$DB_PASSWORD",
    "database": "$PROD_DB",
    "host": "$DB_HOST",
    "dialect": "mysql"
  }
}
EOF

echo -e "${GREEN}Configuration file 'database.json' created successfully.${NC}"

# Print summary
print_header "Setup complete"
echo "The following databases have been set up:"
echo "  - Development: $DEV_DB"
echo "  - Test: $TEST_DB"
echo "  - Production: $PROD_DB"
echo -e "\nConfiguration file 'database.json' has been created."
echo -e "You can now use these databases with your application.\n"

# Make the script executable if running it for the first time
chmod +x "$0"