const { connectToDatabase, Session } = require("../../utils/db");

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();
        const sessions = await Session.find();
        res.status(200).json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
