const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const db = require('../../db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Currency converter API is running' });
});

// Save a conversion to history
app.post('/api/conversions', async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency, rate, convertedAmount } = req.body;
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
    res.status(500).json({ error: 'Failed to fetch conversion history' });
  }
});

// Get conversion statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getConversionStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversion statistics' });
  }
});

// Get currency distribution
app.get('/api/distribution', async (req, res) => {
  try {
    const distribution = await db.getCurrencyDistribution();
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch currency distribution' });
  }
});

module.exports.handler = serverless(app);
