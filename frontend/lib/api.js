const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getUniverses() {
  const res = await fetch(`${API_BASE}/universes`);
  if (!res.ok) throw new Error('Failed to fetch universes');
  return res.json();
}

export async function generateStory(universe, whatIf, length = 'medium') {
  const res = await fetch(`${API_BASE}/story/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universe, what_if: whatIf, length })
  });
  
  if (!res.ok) throw new Error('Failed to generate story');
  return res.json();
}

export async function getStoryHistory(limit = 20) {
  const res = await fetch(`${API_BASE}/story/history?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function getStory(id) {
  const res = await fetch(`${API_BASE}/story/${id}`);
  if (!res.ok) throw new Error('Failed to fetch story');
  return res.json();
}

export async function rateStory(id, rating) {
  const res = await fetch(`${API_BASE}/story/${id}/rate?rating=${rating}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to rate story');
  return res.json();
}

export async function generateSystemPrompt(universeName) {
  const res = await fetch(`${API_BASE}/universe/system-prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universe: universeName })
  });
  
  if (!res.ok) throw new Error('Failed to generate system prompt');
  return res.json();
}

export async function generateCustomStory(universeName, systemPrompt, whatIf, length = 'medium') {
  const res = await fetch(`${API_BASE}/story/generate-custom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universe: universeName, system_prompt: systemPrompt, what_if: whatIf, length })
  });
  
  if (!res.ok) throw new Error('Failed to generate story');
  return res.json();
}