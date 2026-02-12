from openai import OpenAI
import os


def _get_client():
    """Return an OpenAI client built from the OPENAI_API_KEY env var.

    This defers client creation until it's actually needed so importing this
    module (e.g. to list universes) doesn't require the API key to be set.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")
    return OpenAI(api_key=api_key)

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
    },
    "One Piece": {
        "context": """You are an expert in the One Piece universe by Eiichiro Oda. You know all arcs, Devil Fruits, the Grand Line, and character backstories. You write action-packed adventure with humor, emotional moments, and the spirit of camaraderie.""",
        "characters": ["Luffy", "Zoro", "Nami", "Sanji", "Shanks", "Blackbeard"],
        "world": "Grand Line, Pirate King's Treasure, East Blue, Wano"
    },
    "Naruto": {
        "context": """You are an expert in the Naruto universe. You know the ninja world, jutsu, chakra, ninja villages, and all character developments from Naruto to Boruto. You write stories with themes of perseverance, friendship, and ninja honor.""",
        "characters": ["Naruto Uzumaki", "Sasuke Uchiha", "Kakashi", "Gaara", "Itachi", "Madara"],
        "world": "Hidden Leaf Village, Ninja Academy, Chakra System, Akatsuki"
    },
    "Attack on Titan": {
        "context": """You are an expert in Attack on Titan (Shingeki no Kyojin). You know all seasons, Titans, the Walls, reveals about the world, and complex character motivations. You write dark, intense stories with shocking plot twists and moral dilemmas.""",
        "characters": ["Eren Yeager", "Mikasa Ackerman", "Armin Arlert", "Levi", "Reiner", "Zeke"],
        "world": "Wall Maria, Paradis Island, Marley, The Outside World"
    },
    "DC": {
        "context": """You are an expert in the DC Universe. You know Superman, Batman, Wonder Woman, Justice League, and all DC lore. You write heroic stories with themes of justice, sacrifice, and the struggle between good and evil in a modern world.""",
        "characters": ["Superman", "Batman", "Wonder Woman", "The Flash", "Green Lantern", "Aquaman"],
        "world": "Metropolis, Gotham, Themyscira, Central City"
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
        model="gpt-4o-mini",
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

def generate_universe_prompt(universe_name: str) -> str:
    """Generate a system prompt for a custom universe"""
    prompt = f"""Create a detailed system prompt for an AI writer to generate stories in the "{universe_name}" universe.

The system prompt should:
1. Establish the AI as an expert in the {universe_name} universe
2. List key characters and elements from {universe_name}
3. Describe the tone, style, and atmosphere of {universe_name}
4. Include specific details about the world, rules, and lore
5. Guide the AI to write authentic stories that fit the universe

Format the response as a complete system prompt that can be used directly with an AI model. Start with "You are an expert in the {universe_name} universe..." and make it comprehensive but concise (150-200 words)."""
    
    client = _get_client()

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an expert at creating detailed system prompts for creative AI writers."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,
        temperature=0.7
    )
    
    return response.choices[0].message.content

def generate_story_with_prompt(universe: str, system_prompt: str, what_if: str, length: str = "medium") -> str:
    """Generate a story using a custom system prompt"""
    length_specs = {
        "short": "500-800 words, focus on one key scene",
        "medium": "1000-1500 words, include 2-3 key scenes with character development",
        "long": "1800-2500 words, full narrative arc with multiple scenes and deeper exploration"
    }
    
    prompt = f"""Write a {length} alternative story exploring this 'What If' scenario:

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
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        max_tokens=3000,
        temperature=0.8
    )
    
    return response.choices[0].message.content