from groq import Groq
import os


def _get_client():
    """Return a Groq client built from the GROQ_API_KEY env var.

    This defers client creation until it's actually needed so importing this
    module (e.g. to list universes) doesn't require the API key to be set.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
    return Groq(api_key=api_key)

# Universe knowledge bases
UNIVERSES = {
    "Harry Potter": {
        "context": """You are an expert in the Harry Potter universe. You know all seven books, characters, spells, locations, and lore intimately. You write in J.K. Rowling's style with rich descriptions, British terminology, and magical atmosphere.""",
        "characters": ["Harry Potter", "Hermione Granger", "Ron Weasley", "Voldemort", "Dumbledore", "Snape"],
        "world": "Hogwarts, Ministry of Magic, Diagon Alley"
    },
    "Lord of the Rings": {
        "context": """You are an expert in Tolkien's Middle-earth. You know The Hobbit, LOTR trilogy, and the lore of Middle-earth. You write in Tolkien's epic, detailed style with archaic language and grand descriptions.""",
        "characters": ["Frodo", "Gandalf", "Aragorn", "Legolas", "Gimli", "Sauron"],
        "world": "The Shire, Mordor, Rivendell, Rohan"
    },
    "Marvel MCU": {
        "context": """You are an expert in the Marvel Cinematic Universe. You know all movies, characters, powers, and storylines. You write action-packed stories with witty dialogue and dramatic moments.""",
        "characters": ["Iron Man", "Captain America", "Thor", "Hulk", "Black Widow", "Thanos"],
        "world": "Avengers Tower, Wakanda, Asgard, New York"
    },
    "Star Wars": {
        "context": """You are an expert in the Star Wars universe. You know all movies, characters, Force powers, and galactic lore. You write epic space opera with dramatic conflict between light and dark.""",
        "characters": ["Luke Skywalker", "Darth Vader", "Yoda", "Han Solo", "Leia", "Obi-Wan"],
        "world": "Tatooine, Coruscant, Death Star, Endor"
    }
}

def generate_story(universe: str, what_if: str, length: str = "medium") -> dict:
    """Generate a 'what if' story"""
    
    if universe not in UNIVERSES:
        raise ValueError(f"Universe '{universe}' not supported")
    
    universe_info = UNIVERSES[universe]
    
    # Length specifications
    length_specs = {
        "short": "500-800 words, focus on one key scene",
        "medium": "1000-1500 words, include 2-3 key scenes with character development",
        "long": "1800-2500 words, full narrative arc with multiple scenes and deeper exploration"
    }
    
    prompt = f"""{universe_info['context']}

Write a {length} alternative story exploring this 'What If' scenario:

**What If: {what_if}**

Guidelines:
- Length: {length_specs.get(length, length_specs['medium'])}
- Stay true to the universe's tone, rules, and character personalities
- Make it compelling with conflict, emotion, and resolution
- Include specific details from the {universe} universe
- Write a complete story with beginning, middle, and end

Begin the story now:"""

    client = _get_client()

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a creative writer who specializes in alternative universe fiction."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=3000,
        temperature=0.8  # Higher temperature for more creativity
    )
    
    story_text = response.choices[0].message.content
    word_count = len(story_text.split())
    
    return {
        "story": story_text,
        "word_count": word_count,
        "universe": universe,
        "what_if": what_if
    }

def get_available_universes():
    """Return list of supported universes"""
    return list(UNIVERSES.keys())