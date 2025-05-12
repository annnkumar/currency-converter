require('dotenv').config();
const { Pool } = require('pg');

// Create a new pool instance using the database URL from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the conversions table if it doesn't exist
const createTablesQuery = `
  CREATE TABLE IF NOT EXISTS conversions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL NOT NULL,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    conversion_rate DECIMAL NOT NULL,
    converted_amount DECIMAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Initialize the database by creating tables
async function initializeDatabase() {
  try {
    await pool.query(createTablesQuery);
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
}

// Save a conversion record to the database
async function saveConversion(amount, fromCurrency, toCurrency, rate, convertedAmount) {
  const query = `
    INSERT INTO conversions (amount, from_currency, to_currency, conversion_rate, converted_amount)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, created_at;
  `;
  
  try {
    const result = await pool.query(query, [amount, fromCurrency, toCurrency, rate, convertedAmount]);
    return result.rows[0];
  } catch (error) {
    console.error('Error saving conversion:', error);
    throw error;
  }
}

// Get conversion history (most recent first, limited to limit)
async function getConversionHistory(limit = 10) {
  const query = `
    SELECT * FROM conversions
    ORDER BY created_at DESC
    LIMIT $1;
  `;
  
  try {
    const result = await pool.query(query, [limit]);
    return result.rows;
  } catch (error) {
    console.error('Error getting conversion history:', error);
    throw error;
  }
}

// Get statistics on most commonly converted currencies
async function getConversionStats() {
  const query = `
    SELECT 
      from_currency, 
      to_currency, 
      COUNT(*) as count
    FROM conversions
    GROUP BY from_currency, to_currency
    ORDER BY count DESC
    LIMIT 5;
  `;
  
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting conversion stats:', error);
    throw error;
  }
}

// Get currency distribution statistics
async function getCurrencyDistribution() {
  const query = `
    SELECT 
      currency_code, 
      COUNT(*) as count
    FROM (
      SELECT from_currency as currency_code FROM conversions
      UNION ALL
      SELECT to_currency as currency_code FROM conversions
    ) AS all_currencies
    GROUP BY currency_code
    ORDER BY count DESC
    LIMIT 10;
  `;
  
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting currency distribution:', error);
    throw error;
  }
}

module.exports = {
  pool,
  initializeDatabase,
  saveConversion,
  getConversionHistory,
  getConversionStats,
  getCurrencyDistribution
};