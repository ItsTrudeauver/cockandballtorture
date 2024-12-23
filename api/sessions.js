
const mongoose = require('mongoose');

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@100m100w.tbtwm.mongodb.net/?retryWrites=true&w=majority&appName=100m100w`;
let cachedDb = null;

// MongoDB connection handler (cached for serverless efficiency)
async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    const connection = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    cachedDb = connection;
    return connection;
}

// Session schema and model
const sessionSchema = new mongoose.Schema({
    playerName: String,
    date: String,
    men: Array,
    women: Array,
    menTime: Number,
    womenTime: Number,
    totalTime: Number,
});

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

// API handler
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const newSession = new Session(req.body);
        const savedSession = await newSession.save();

        res.status(201).json(savedSession);
    } catch (error) {
        console.error('Error saving session:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
