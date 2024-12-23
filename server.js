require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['https://100m100w.vercel.app', 'http://localhost:3000'], // Add localhost
}));
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@100m100w.tbtwm.mongodb.net/?retryWrites=true&w=majority&appName=100m100w`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Mongoose Schema
const sessionSchema = new mongoose.Schema({
  playerName: String,
  date: String,
  men: Array,
  women: Array,
  menTime: Number,
  womenTime: Number,
  totalTime: Number,
});

const Session = mongoose.model('Session', sessionSchema);

// Routes
app.post('/sessions', async (req, res) => {
  try {
    const newSession = new Session(req.body);
    await newSession.save();
    res.status(201).json(newSession);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find();
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/sessions', async (req, res) => {
  try {
    await Session.deleteMany({});
    res.status(200).json({ message: 'All sessions cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
