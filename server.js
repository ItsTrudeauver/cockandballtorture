const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Allow CORS from your deployed frontend
app.use(cors({ origin: 'https://100m100w.vercel.app', credentials: true }));
app.use(bodyParser.json());

// MongoDB connection directly in code
mongoose.connect('mongodb+srv://LNDK:lndk04082002@100m100w.mongodb.net/leaderboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  bestTime: Number,
});

const User = mongoose.model('User', userSchema);

// Register User
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }
    const newUser = new User({ username, password, bestTime: null });
    await newUser.save();
    res.status(200).send('User registered successfully');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Login User
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(400).send('Invalid credentials');
    }
    res.status(200).json({ username, bestTime: user.bestTime });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update Leaderboard
app.post('/update', async (req, res) => {
  const { username, time } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }
    if (user.bestTime === null || time < user.bestTime) {
      user.bestTime = time;
      await user.save();
    }
    res.status(200).send('Leaderboard updated');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get Leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.find().sort({ bestTime: 1 }).limit(5);
    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Start server
const PORT = process.env.PORT || 3000; // Vercel may set the port dynamically
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
