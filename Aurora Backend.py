from flask import Flask, request, jsonify
import requests
import json
from google import genai
import os
from dotenv import load_dotenv
from flask_cors import CORS
# Load environment variables
load_dotenv()
GEMENI_API_KEY = os.getenv("GEMENI_API_KEY")
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")

def generate_itinerary(user_input):
    prompt = f"""
    You are an expert travel planner and narrator.
    A traveler is visiting {user_input['destination']}. 
    They are {'' if user_input['solo'] else 'not '}traveling alone and have {user_input['time_slot']} to explore.
    Interests: {', '.join(user_input['interests'])}
    Budget: {user_input['budget']}
    {'' if not user_input['accessibility'] else 'Ensure accessibility-friendly recommendations.'}
    {'' if not user_input['restaurants'] else 'Include restaurant suggestions.'}
    
    Provide a structured SHORT itinerary with multiple stops, each including:
    - Location name
    - A compelling description with historical or cultural fact if applicable, in an engaging storytelling for a narrated experience optimized for AI voice narration.
    - A time slot for the visit
    - Accessibility options if applicable (e.g. wheelchair access, etc.)

    Format the response in distinct sections as follows:
        [Location Name 1 (e.g. Riyadh Museum)]
        ===
        [Narration 1 (max 200 words)]
        ===
        [Rating number out of 5 (e.g. 4)]
        ===
        [Interests (e.g. Historical, Nature, Parking, Accessiblity, etc...)]
        ===
        [Exact Location (e.g. (Jeddah Corniche, Jeddah))]
        ===
        [Timeslot (e. g. 1:00-4:00 PM)]
        ===
        [Budget (e.g. Free, 50-100 SAR, etc...)]
        ===
        [Website of the place (e.g. https://www.museumofart.com)]
        ---
        [Location Name 2 (e.g. Museum of Art)]
        ===
        [Narration 2 (max 200 words)]
        ===
        [Interests (e.g. Historical, Nature, Parking, Accessiblity, etc...)]
        ===
        [Exact Location (Jeddah Corniche, Jeddah)]
        ===
        [Timeslot (e. g. 1:00-4:00 PM)]
        ===
        [Budget (e.g. Free, 50-100 SAR, etc...) MUST BE A SHORT ANSWER]
        ===
        [Website of the place (e.g. https://www.museumofart.com)]
        ---
        (repeat for more locations)
        Remove anything with square brackets [] and replace it with the relevant information (MAKE SURE TO REMOVE THE BRACKETS).

    INSURE TO FOLLOW THESE GUIDELINES:
    DO NOT WRITE ANY EXTRA TEXT IN THE RESPONSE.
    ENSURE THE FORMAT IS STRICTLY FOLLOWED.
    THE NARRATION MUST NOT EXCEED 200 WORDS PER LOCATION AND MUST NOT INCLUDE ANY MARKDOWN CHARACTERS (e.g. bolding text with **text**).
    ENSURE NO LOCATION IS REPEATED IN THE RESPONSE.
    ENSURE THE RESPONSE INCLUDES AT LEAST 3 LOCATIONS AND NO MORE THAN 10 LOCATIONS.
    ENSURE THE TIMELINE IS REALISTIC AND ALLOWS FOR TRAVEL TIME BETWEEN LOCATIONS.
    ENSURE NO TWO LOCATIONS ARE AT THE SAME TIMESLOT.
    DO NOT WRITE THE ZIP CODE IN THE EXACT LOCATION.
    ENSURE THE BUDGET IS REALISTIC FOR THE LOCATION.
    ENSURE THE WEBSITE IS REAL AND RELEVANT TO THE LOCATION.
    ENSURE THE WEBSITE IS A FULL URL (e.g. https://www.museumofart.com).
    """
    client = genai.Client(api_key=GEMENI_API_KEY)
    print("Sending prompt to Gemini API...")
    response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
    print(f"Response Complete!")
    
    if not response:
        print("No response received from Gemini API.")
        return []

    segments = []
    stops = response.text.split("\n---\n")
    for stop in stops:
        parts = stop.split("\n===\n")
        if len(parts) < 3:
            continue
        location_name, narration, rating, interests, exact_location, timeslot, price, website = parts[:8]
        print(f"Processing stop: {location_name.strip()}")
        image_url = fetch_image(location_name.strip()) if location_name.strip() else None
        tts_file = generate_voiceover(narration.strip(), location_name.strip())  # Uncomment this line
        segments.append({
            "location_name": location_name.strip('[]'),
            "text": narration.strip(),
            "rating" : int(rating.strip()),
            "interests": interests.strip().split(","),  # Split interests into list
            "exact_location" : exact_location.strip(),
            "time_slot": timeslot.strip(),
            "price": price.strip(),
            "website": website.strip(),
            "image_url": image_url,
            "tts_filename": tts_file
        })
    
    save_response_to_markdown(segments)

    return segments

# Generate voiceovers
def generate_voiceover(text, name=""):
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "text": text,
        "voice_settings": {
            "stability": 0.7,
            "similarity_boost": 0.75
        }
    }
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    print("Sending request to ElevenLabs API for voiceover...")
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        os.makedirs("static/tts_files", exist_ok=True)  # Ensure directory exists
        filename = f"{name.replace(' ', '_')}_voiceover.mp3"
        audio_filename = f"static/tts_files/{filename}"

        with open(audio_filename, "wb") as f:
            f.write(response.content)
        
        print(f"Voiceover saved: {audio_filename}")
        return f"http://localhost:5000/static/tts_files/{filename}"  # Return full URL
    print(f"ElevenLabs API error: {response.status_code} - {response.text}")
    return None


# Fetch Images
def fetch_image(query):
    url = "https://api.pexels.com/v1/search"
    headers = {"Authorization": PEXELS_API_KEY}
    params = {"query": query, "per_page": 1}
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200 and response.json()["photos"]:
        image_url = response.json()["photos"][0]["src"]["medium"]
        print(f"Fetched image for {query}: {image_url}")
        return image_url
    print("No image found.")
    return None

# Testing Purposes
def save_response_to_markdown(response_text, filename="gemini_response.txt"):
    with open(filename, "w") as f:
        f.write(json.dumps(response_text, indent=4))
    print(f"Saved Gemini API response to {filename}")

def test_generate():
    dummy_input = {
        "destination": "Riyadh",
        "solo": False,
        "time_slot": "morning to evening",
        "interests": ["historical sites", "museums"],
        "budget": "medium",
        "accessibility": True,
        "restaurants": True
    }
    print("Testing generate_itinerary with dummy input...")
    result = generate_itinerary(dummy_input)
    return result

# App
app = Flask(__name__, static_url_path='/static', static_folder='static')
CORS(app)  # Enable CORS for all routes

@app.route("/generate", methods=["POST"])
def generate():
    try:
        user_input = request.json
        print(f"API call received with input: {user_input}")
        
        # Validate and set default values for all fields
        user_input = {
            'destination': user_input.get('destination'),
            'solo': user_input.get('solo', False),
            'time_slot': user_input.get('time_slot'),
            'interests': user_input.get('interests', []),
            'budget': user_input.get('budget'),
            'accessibility': user_input.get('accessibility', False),
            'restaurants': user_input.get('restaurants', False)
        }

        # Validate required fields
        required_fields = ['destination', 'time_slot', 'interests', 'budget']
        missing_fields = [field for field in required_fields if not user_input.get(field)]
        
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Ensure interests is a list
        if not isinstance(user_input['interests'], list):
            user_input['interests'] = [user_input['interests']]

        itinerary = generate_itinerary(user_input)
        
        if not itinerary:
            return jsonify({"error": "Failed to generate itinerary"}), 500
            
        return jsonify({"itinerary": itinerary})
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Add this near the top of the file after imports
def validate_api_keys():
    missing_keys = []
    if not GEMENI_API_KEY:
        missing_keys.append("GEMENI_API_KEY")
    if not PEXELS_API_KEY:
        missing_keys.append("PEXELS_API_KEY")
    if not ELEVENLABS_API_KEY:
        missing_keys.append("ELEVENLABS_API_KEY")
    if not ELEVENLABS_VOICE_ID:
        missing_keys.append("ELEVENLABS_VOICE_ID")
    
    return True

if __name__ == "__main__":
    if not validate_api_keys():
        print("Error: Missing required API keys. Please check your .env file.")
        exit(1)
    print("Launching Flask server...")
    app.run(debug=True, port=5000)
