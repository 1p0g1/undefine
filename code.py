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
        "apple"
    ]
    return random.choice(words)  # Selects a random word from the list

# Function to fetch definition using Oxford API
def get_definition(word):
    # Ensure the word is in lowercase, as Oxford may require lowercase for proper matching
    url = f"{BASE_URL}/entries/en-gb/{word.lower()}"
    headers = {
        "app_id": APP_ID,
        "app_key": APP_KEY
    }
    response = requests.get(url, headers=headers)
    
    # Debugging: Print the status code and content of the API response for further insight
    st.write(f"Debug: API Status Code: {response.status_code}")
    st.write(f"Debug: Request URL: {url}")  # Checking the URL being called

    if response.status_code == 200:
        data = response.json()
        st.write("Debug: API Response JSON:", data)  # Print the full JSON response for inspection

        try:
            # Extracting the definition from the API response
            senses = data["results"][0]["lexicalEntries"][0]["entries"][0]["senses"]
            if senses:
                # Picking the first definition (if available)
                definition = senses[0]["definitions"][0]
                return definition
            else:
                return "No definition found in the response."
        except KeyError as e:
            st.error(f"Error parsing API response: {e}")
            st.write("Full API response for debugging:", data)
            return None
    else:
        st.error(f"API Request Failed with Status Code: {response.status_code}")
        st.write("Response Content:", response.text)  # Full response content for detailed debugging
        return None

# Fetch a random word and definition (initially)
if "daily_word" not in st.session_state:
    st.session_state.daily_word = get_random_word()  # Get a random word each day
    st.session_state.definition = get_definition(st.session_state.daily_word)

# Reload word button
if st.button("Reload Word"):
    st.session_state.daily_word = get_random_word()  # Get a random word each time
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
