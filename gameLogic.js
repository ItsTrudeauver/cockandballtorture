const BASE_URL = 'https://100m100w.vercel.app';

async function registerUser() {
  const username = prompt('Enter a new username:');
  const password = prompt('Enter a new password:');

  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      alert(`Registration successful! Welcome, ${username}!`);
      return username;
    } else {
      const error = await response.text();
      alert(`Error: ${error}`);
      return null;
    }
  } catch (error) {
    console.error('Error during registration:', error);
    alert('An error occurred during registration.');
    return null;
  }
}

async function loginUser() {
  const username = prompt('Enter your username:');
  const password = prompt('Enter your password:');

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const result = await response.json();
      alert(`Welcome back, ${result.username}!`);
      return result.username;
    } else {
      const error = await response.text();
      alert(`Error: ${error}`);
      return null;
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('An error occurred during login.');
    return null;
  }
}

async function updateLeaderboard(username, time) {
  try {
    const response = await fetch(`${BASE_URL}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, time }),
    });

    if (!response.ok) {
      const error = await response.text();
      alert(`Error updating leaderboard: ${error}`);
    }
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    alert('An error occurred while updating the leaderboard.');
  }
}

async function fetchLeaderboard() {
  try {
    const response = await fetch(`${BASE_URL}/leaderboard`);
    if (response.ok) {
      return await response.json(); // Leaderboard as an array
    } else {
      const error = await response.text();
      alert(`Error fetching leaderboard: ${error}`);
      return [];
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    alert('An error occurred while fetching the leaderboard.');
    return [];
  }
}

function displayLeaderboard(ctx) {
  fetchLeaderboard().then((leaderboard) => {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';

    ctx.fillText('Leaderboard (Best Times):', 10, 30);
    leaderboard.slice(0, 5).forEach((entry, index) => {
      ctx.fillText(
        `${index + 1}. ${entry.username} - ${
          entry.bestTime ? entry.bestTime + 's' : 'No Time'
        }`,
        10,
        60 + index * 30
      );
    });
  });
}

async function startGame() {
  let username;
  const isNewUser = confirm('Are you a new user? Click OK to register or Cancel to log in.');
  if (isNewUser) {
    username = await registerUser();
  } else {
    username = await loginUser();
  }

  if (!username) {
    return; // Exit if registration/login fails
  }

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  let timeCleared = 0;
  const startTime = Date.now();

  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    timeCleared = Math.floor((Date.now() - startTime) / 1000);
    ctx.fillText(`Time Cleared: ${timeCleared}s`, 10, 20);

    displayLeaderboard(ctx);

    if (timeCleared >= 30) {
      clearInterval(interval);
      updateLeaderboard(username, timeCleared);
      alert(`Game over! Your time cleared: ${timeCleared}s`);
    }
  }, 1000);
}
