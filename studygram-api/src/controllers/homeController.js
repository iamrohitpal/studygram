const db = require('../config/db');

exports.getHome = (req, res) => {
  res.json({
    message: 'Welcome to the Studygram API',
    status: 'healthy',
    timestamp: new Date()
  });
};

exports.checkDbStatus = async (req, res) => {
  try {
    // Quick query to verify mysql connection status
    const [rows] = await db.query('SELECT 1 + 1 AS solution');
    res.json({
      status: 'success',
      message: 'Database connection successful',
      solution: rows[0].solution
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
};
