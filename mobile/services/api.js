import BASE_URL from '../config';

const TIMEOUT_MS = 10000;

function fetchWithTimeout(url, options) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS)
    ),
  ]);
}

export async function checkUpi(upiId) {
  const response = await fetchWithTimeout(`${BASE_URL}/check-upi`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ upiId }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json();
}

export async function checkHealth() {
  const response = await fetchWithTimeout(`${BASE_URL}/health`, {
    method: 'GET',
  });
  return response.json();
}
