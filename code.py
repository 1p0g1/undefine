import requests
import random
import streamlit as st
from datetime import datetime

# Oxford API credentials
APP_ID = "22beb17a"
APP_KEY = "aa89a15541dc6df0613e2282087e5e0f"
BASE_URL = "https://od-api-sandbox.oxforddictionaries.com/api/v2"

# App title
st.title("Daily Define")

# Instructions
st.write("Guess the word based on its definition! A new word is available every day.")

# Function to fetch a random word from a simple word list
def get_random_word():
    # Simplified word list (common and easy-to-find words)
    words = [
        "cat", "dog", "house", "book", "apple", "tree", "car", "chair", "pen", "table"
    ]
    return random.choice(words)  # Selects a random word from the list

# Function to fetch definition using Oxford API
def get_definition(word):
    # Try fetching with both 'en-gb' and 'en' language filters
    url_en_gb = f"{BASE_URL}/entries/en-gb/{word.lower()}"
    url_en = f"{BASE_URL}/entries/en/{word.lower()}"
    headers = {
        "app_id": APP_ID,
        "app_key": APP_KEY
    }

    # First, try fetching with the 'en-gb' filter
    response = requests.get(url_en_gb, headers=headers)
    if response.status_code == 200:
        data = response.json()
        return extract_definition(data)
    
    # If 'en-gb' fails, try fetching with 'en' filter
    response = requests.get(url_en, headers=headers)
    if response.status_code == 200:
        data = response.json()
        return extract_definition(data)

    # If both requests fail, return None
    return None

# Function to extract the definition from the API response
def extract_definition(data):
    try:
        senses = data["results"][0]["lexicalEntries"][0]["entries"][0]["senses"]
        if senses:
            # Extract the definition from the senses
            return senses[0]["definitions"][0]
    except (KeyError, IndexError):
        st.error("Error parsing API response.")
    return None

# Fetch a random word and definition
if "daily_word" not in st.session_state:
    st.session_state.daily_word = get_random_word()  # Get a random word each day
    st.session_state.definition = get_definition(st.session_state.daily_word)

# Display the definition
if st.session_state.definition:
    st.write(f"**Definition:** {st.session_state.definition}")
else:
    st.error("Could not fetch the definition for today's word.")
    st.write("The word for today was:", st.session_state.daily_word)
    st.stop()

# Input field for the user's guess
guess = st.text_input("What is your guess?")

# Feedback logic
if "outcome" not in st.session_state:
    st.session_state.outcome = None

if st.button("Submit Guess"):
    if guess.lower() == st.session_state.daily_word.lower():
        st.session_state.outcome = "correct"
        st.success("🎉 Correct! Well done!")
    else:
        st.session_state.outcome = "incorrect"
        st.error(f"❌ Wrong! The correct word was **{st.session_state.daily_word}**.")

# Generate a share message
if st.session_state.outcome:
    share_message = (
        f"Daily Define\n"
        f"{datetime.now().strftime('%Y-%m-%d')}\n"
        f"{st.session_state.outcome.capitalize()}\n"
        f"define.today"
    )
    st.write("Share your result:")
    st.code(share_message)
