#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database name
DB_NAME="reversedefine"

# Function to validate CSV format
validate_csv_format() {
    local file=$1
    # Check header format
    expected_header="word,definition,etymology,first_letter,in_a_sentence,number_of_letters,equivalents,difficulty"
    actual_header=$(head -n 1 "$file")
    if [ "$actual_header" != "$expected_header" ]; then
        echo -e "${RED}Error: Invalid CSV header format${NC}"
        echo -e "Expected: $expected_header"
        echo -e "Found: $actual_header"
        return 1
    fi
    return 0
}

# Function to create backup
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="backup_words_${timestamp}.csv"
    echo -e "${YELLOW}Creating backup...${NC}"
    psql $DB_NAME -c "\COPY (SELECT word, definition, etymology, first_letter, example_sentence as in_a_sentence, length(word) as number_of_letters, '' as equivalents, difficulty FROM words) TO '$backup_file' WITH CSV HEADER;"
    echo -e "${GREEN}Backup created: $backup_file${NC}"
}

# Function to validate words
validate_words() {
    local file=$1
    echo -e "${YELLOW}Validating words...${NC}"
    psql $DB_NAME -f validate_words.sql
}

# Function to import words
import_words() {
    local file=$1
    echo -e "${YELLOW}Importing words...${NC}"
    psql $DB_NAME -f import_new_words.sql
}

# Main menu
while true; do
    echo -e "\n${GREEN}=== Word Management System ===${NC}"
    echo "1. Validate new words CSV"
    echo "2. Import new words CSV"
    echo "3. Create database backup"
    echo "4. Show word statistics"
    echo "5. Exit"
    read -p "Choose an option (1-5): " choice

    case $choice in
        1)
            read -p "Enter CSV filename: " filename
            if [ ! -f "$filename" ]; then
                echo -e "${RED}Error: File not found${NC}"
                continue
            fi
            validate_csv_format "$filename" && validate_words "$filename"
            ;;
        2)
            read -p "Enter CSV filename: " filename
            if [ ! -f "$filename" ]; then
                echo -e "${RED}Error: File not found${NC}"
                continue
            fi
            create_backup
            import_words "$filename"
            ;;
        3)
            create_backup
            ;;
        4)
            echo -e "${YELLOW}Fetching statistics...${NC}"
            psql $DB_NAME -c "
                SELECT 
                    COUNT(*) as total_words,
                    COUNT(DISTINCT first_letter) as unique_first_letters,
                    ROUND(AVG(length(word))::numeric, 2) as avg_word_length,
                    COUNT(*) FILTER (WHERE difficulty = 'Easy') as easy_words,
                    COUNT(*) FILTER (WHERE difficulty = 'Medium') as medium_words,
                    COUNT(*) FILTER (WHERE difficulty = 'Hard') as hard_words
                FROM words;"
            ;;
        5)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
done 