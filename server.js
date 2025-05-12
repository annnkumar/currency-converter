const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize the database
db.initializeDatabase();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Currency converter API is running' });
});

// Save a conversion to history
app.post('/api/conversions', async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency, rate, convertedAmount } = req.body;
    
    // Validate input
    if (!amount || !fromCurrency || !toCurrency || !rate || !convertedAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await db.saveConversion(amount, fromCurrency, toCurrency, rate, convertedAmount);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error saving conversion:', error);
    res.status(500).json({ error: 'Failed to save conversion' });
  }
});

// Get conversion history
app.get('/api/conversions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await db.getConversionHistory(limit);
    res.json(history);
  } catch (error) {
    console.error('Error fetching conversion history:', error);
    res.status(500).json({ error: 'Failed to fetch conversion history' });
  }
});

// Get conversion statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getConversionStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching conversion stats:', error);
    res.status(500).json({ error: 'Failed to fetch conversion statistics' });
  }
});

// Get currency distribution
app.get('/api/distribution', async (req, res) => {
  try {
    const distribution = await db.getCurrencyDistribution();
    res.json(distribution);
  } catch (error) {
    console.error('Error fetching currency distribution:', error);
    res.status(500).json({ error: 'Failed to fetch currency distribution' });
  }
});

// Serve static files for any other routes (SPA support)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static('public'));

// Serve statistics page
app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

// Catch-all route to handle SPA navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});