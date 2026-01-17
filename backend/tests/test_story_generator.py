import pytest
from unittest.mock import patch, MagicMock
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import story_generator

def test_get_available_universes():
    universes = story_generator.get_available_universes()
    assert isinstance(universes, list)
    assert len(universes) >= 5
    assert "Harry Potter" in universes
    # Correct key is Marvel MCU, not Marvel Cinematic Universe
    assert "Marvel MCU" in universes

@patch('story_generator.Groq')
def test_generate_story_with_prompt_success(mock_groq_class):
    """Test successful story generation with mocked AI response"""
    # Setup mock client instance
    mock_client = MagicMock()
    mock_groq_class.return_value = mock_client
    
    # Setup mock response
    mock_completion = MagicMock()
    mock_completion.choices[0].message.content = "Generated story content."
    mock_client.chat.completions.create.return_value = mock_completion

    system_prompt = "You are a storyteller."
    user_prompt = "Tell me a story."
    
    # Mock OS environment to ensure _get_client works
    with patch.dict(os.environ, {"GROQ_API_KEY": "fake_key"}):
        result = story_generator.generate_story_with_prompt("Custom", system_prompt, user_prompt)
    
    assert result == "Generated story content."
    
    # Verify API called
    mock_client.chat.completions.create.assert_called_once()
    call_args = mock_client.chat.completions.create.call_args
    # call_args.kwargs might differ based on impl, but let's check basic passed args
    assert "messages" in call_args.kwargs
    assert call_args.kwargs['messages'][0]['content'] == system_prompt

@patch('story_generator.Groq')
def test_generate_story_with_prompt_failure(mock_groq_class):
    """Test API failure handling"""
    mock_client = MagicMock()
    mock_groq_class.return_value = mock_client
    mock_client.chat.completions.create.side_effect = Exception("API Error")
    
    with patch.dict(os.environ, {"GROQ_API_KEY": "fake_key"}):
        with pytest.raises(Exception):
            story_generator.generate_story_with_prompt("u", "s", "p")

def test_universe_definitions():
    """Verify UNIVERSES dict structure"""
    from story_generator import UNIVERSES
    
    assert "Harry Potter" in UNIVERSES
    hp = UNIVERSES["Harry Potter"]
    assert "context" in hp
    assert "characters" in hp

@patch('story_generator.Groq')
def test_generate_universe_prompt(mock_groq_class):
    """Test generating a system prompt for a custom universe"""
    # Setup mock
    mock_client = MagicMock()
    mock_groq_class.return_value = mock_client
    mock_completion = MagicMock()
    mock_completion.choices[0].message.content = "System prompt content."
    mock_client.chat.completions.create.return_value = mock_completion
    
    with patch.dict(os.environ, {"GROQ_API_KEY": "fake_key"}):
        result = story_generator.generate_universe_prompt("Cyberpunk City")
        
    assert result == "System prompt content."
    mock_client.chat.completions.create.assert_called_once()
