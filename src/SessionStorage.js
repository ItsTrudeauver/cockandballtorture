const API_BASE_URL = '/api/sessions';

export const saveSession = async (session) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

export const getSessions = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    return await response.json();
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
};

export const clearSessions = async () => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error clearing sessions:', error);
  }
};
