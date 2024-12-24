const { connectToDatabase, Session } = require("../../utils/db");

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    let rawBody = "";

    try {
 
        await new Promise((resolve, reject) => {
            req.on("data", (chunk) => {
                rawBody += chunk;
            });
            req.on("end", resolve);
            req.on("error", reject);
        });

        const body = JSON.parse(rawBody);

       
        if (!body.playerName || !body.date) {
            return res.status(400).json({ message: "Missing required fields: playerName or date" });
        }

        await connectToDatabase();

        const sessionData = {
            playerName: body.playerName,
            date: body.date,
            menTime: body.menTime || 0,
            womenTime: body.womenTime || 0,
            totalTime: body.totalTime || 0,
        };

        const newSession = new Session(sessionData);
        const savedSession = await newSession.save();

        res.status(201).json(savedSession);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(400).json({ message: "Invalid JSON body", error: error.message });
    }
};
