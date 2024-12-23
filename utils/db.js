const mongoose = require("mongoose");

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_URI}`;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const connection = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        cachedDb = connection;
        console.log("Connected to MongoDB");
        return connection;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw error;
    }
}

const sessionSchema = new mongoose.Schema({
    playerName: String,
    date: String,
    men: Array,
    women: Array,
    menTime: Number,
    womenTime: Number,
    totalTime: Number,
});

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);

module.exports = { connectToDatabase, Session };
