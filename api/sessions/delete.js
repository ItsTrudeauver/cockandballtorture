const { connectToDatabase, Session } = require("../../utils/db");

module.exports = async (req, res) => {
    if (req.method != 'DELETE') {
        return res.json({ message: 'Method not allowed, DELETE expected' });
    }

    try {
        await connectToDatabase();
        await Session.deleteMany({});
        res.status(200).json({ message: 'All sessions cleared' });
    } catch (error) {
        console.error('Error clearing sessions:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
