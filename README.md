# Currency Converter Pro

A full-stack currency conversion application with real-time exchange rates, conversion history tracking, and analytics.

## Video Demo



https://github.com/user-attachments/assets/80ca11e1-bf43-4ad2-a8dd-b99a73dfab30




## Features

- **Real-time Currency Conversion**: Convert between multiple currencies using up-to-date exchange rates
- **Conversion History**: Track your previous currency conversions
- **Statistics Dashboard**: View analytics on your most used currencies and conversion patterns
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Swap Functionality**: Easily switch between source and target currencies
- **Quick Sample Conversion**: See how the converter works with a sample conversion

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (in-memory database for local development)
- **API**: Exchange Rate API for real-time currency data

## Setup and Installation

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm (Node Package Manager)

### Installation Steps

1. Clone the repository
   ```
   git clone https://github.com/yourusername/currency-converter-pro.git
   cd currency-converter-pro
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to
   ```
   http://localhost:5000
   ```

## Usage Guide

1. **Basic Conversion**:
   - Enter the amount you wish to convert
   - Select the source currency from the "From" dropdown
   - Select the target currency from the "To" dropdown
   - Click "Convert" to see the result

2. **Swapping Currencies**:
   - Click the "Swap Currencies" button to reverse your conversion

3. **Viewing History**:
   - Scroll down to see your conversion history
   - History shows source/target currencies, amounts, and timestamps

4. **Statistics View**:
   - Navigate to `/stats` to view analytics
   - See distribution of currencies used
   - Check most common currency pairs

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Check API status |
| `/api/conversions` | POST | Save a new conversion |
| `/api/conversions` | GET | Get conversion history |
| `/api/stats` | GET | Get conversion statistics |
| `/api/distribution` | GET | Get currency distribution data |

## Development

- Run with auto-reload: `npm run dev`
- Run in production mode: `npm start`



## License

[MIT License](LICENSE)

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.
