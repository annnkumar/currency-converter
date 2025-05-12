// Currency Converter Application

// Global variables
let currencyData = {};
let exchangeRates = {};
let lastUpdated = null;

// DOM Elements
const converterForm = document.getElementById('converter-form');
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const swapButton = document.getElementById('swap-btn');
const resultContainer = document.getElementById('result-container');
const conversionResult = document.getElementById('conversion-result');
const conversionRate = document.getElementById('conversion-rate');
const lastUpdatedElement = document.getElementById('last-updated');
const loadingContainer = document.getElementById('loading-container');
const errorContainer = document.getElementById('error-container');
const historyContainer = document.getElementById('history-container');
const historyTableBody = document.getElementById('history-table-body');
const noHistoryElement = document.getElementById('no-history');

// Constants
const API_URL = 'https://api.exchangerate.host';
const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'RUB'];
const COMMON_CURRENCY_NAMES = {
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'GBP': 'British Pound',
    'JPY': 'Japanese Yen',
    'CAD': 'Canadian Dollar',
    'AUD': 'Australian Dollar',
    'CHF': 'Swiss Franc',
    'CNY': 'Chinese Yuan',
    'INR': 'Indian Rupee',
    'RUB': 'Russian Ruble',
    'NZD': 'New Zealand Dollar',
    'MXN': 'Mexican Peso',
    'SGD': 'Singapore Dollar',
    'HKD': 'Hong Kong Dollar',
    'NOK': 'Norwegian Krone',
    'SEK': 'Swedish Krona',
    'TRY': 'Turkish Lira',
    'ZAR': 'South African Rand',
    'BRL': 'Brazilian Real',
    'THB': 'Thai Baht'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadConversionHistory();
});

/**
 * Initialize the application by fetching available currencies
 */
async function initializeApp() {
    try {
        showLoading(true);
        
        // Fetch supported currencies
        await fetchSupportedCurrencies();
        
        // Fetch latest exchange rates
        await fetchExchangeRates('USD'); // Default base currency
        
        // Set default values
        fromCurrencySelect.value = 'USD';
        toCurrencySelect.value = 'EUR';
        
        showLoading(false);
    } catch (error) {
        showError(`Failed to initialize app: ${error.message}`);
        showLoading(false);
    }
}

/**
 * Setup event listeners for the form and buttons
 */
function setupEventListeners() {
    // Form submission event
    converterForm.addEventListener('submit', handleFormSubmit);
    
    // Currency change events
    fromCurrencySelect.addEventListener('change', handleFromCurrencyChange);
    
    // Swap button event
    swapButton.addEventListener('click', swapCurrencies);
    
    // Quick convert button event
    const quickConvertBtn = document.getElementById('quick-convert-btn');
    if (quickConvertBtn) {
        quickConvertBtn.addEventListener('click', performSampleConversion);
    }
    
    // Input validations
    amountInput.addEventListener('input', () => {
        if (amountInput.value < 0) amountInput.value = 0;
    });
}

/**
 * Perform a sample conversion with preset values
 */
function performSampleConversion() {
    // Set preset values
    amountInput.value = 100;
    fromCurrencySelect.value = 'USD';
    toCurrencySelect.value = 'EUR';
    
    // Trigger form submission
    converterForm.dispatchEvent(new Event('submit'));
}

/**
 * Handle form submission
 * @param {Event} event - The form submission event
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Basic validation
    if (!amountInput.value || !fromCurrencySelect.value || !toCurrencySelect.value) {
        showError('Please fill in all fields');
        return;
    }
    
    try {
        showLoading(true);
        hideError();
        
        // Check if we need to fetch new rates
        const fromCurrency = fromCurrencySelect.value;
        if (!exchangeRates[fromCurrency] || isRatesExpired()) {
            await fetchExchangeRates(fromCurrency);
        }
        
        // Perform conversion
        performConversion();
        
        showLoading(false);
    } catch (error) {
        showError(`Conversion failed: ${error.message}`);
        showLoading(false);
    }
}

/**
 * Handle from currency change - fetch new rates if needed
 */
async function handleFromCurrencyChange() {
    const fromCurrency = fromCurrencySelect.value;
    
    // Only fetch new rates if the selected currency is different from current rates
    if (fromCurrency && (!exchangeRates[fromCurrency] || isRatesExpired())) {
        try {
            showLoading(true);
            hideError();
            await fetchExchangeRates(fromCurrency);
            showLoading(false);
        } catch (error) {
            showError(`Failed to get rates for ${fromCurrency}: ${error.message}`);
            showLoading(false);
        }
    }
}

/**
 * Swap the from and to currencies
 */
function swapCurrencies() {
    const tempCurrency = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = tempCurrency;
    
    // If we have an amount, perform the conversion again
    if (amountInput.value) {
        handleFromCurrencyChange();
    }
}

/**
 * Fetch supported currencies from the API
 */
async function fetchSupportedCurrencies() {
    try {
        const response = await fetch(`${API_URL}/symbols`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Failed to fetch currencies');
        }
        
        // Process currency data
        processCurrencyData(data.symbols);
        
        // Populate the currency dropdowns
        populateCurrencyDropdowns();
    } catch (error) {
        // If API fails, use our predefined list
        currencyData = COMMON_CURRENCY_NAMES;
        populateCurrencyDropdowns();
        console.warn('Using predefined currency list due to API error:', error);
    }
}

/**
 * Process currency data into a usable format
 * @param {Object} symbols - Object with currency symbols
 */
function processCurrencyData(symbols) {
    currencyData = {};
    
    Object.entries(symbols).forEach(([code, data]) => {
        currencyData[code] = data.description;
    });
}

/**
 * Populate the currency dropdown selects
 */
function populateCurrencyDropdowns() {
    // Clear existing options except the placeholder
    fromCurrencySelect.innerHTML = '<option value="" disabled>Select currency</option>';
    toCurrencySelect.innerHTML = '<option value="" disabled>Select currency</option>';
    
    // First add popular currencies
    const popularGroup = document.createElement('optgroup');
    popularGroup.label = 'Popular Currencies';
    
    POPULAR_CURRENCIES.forEach(code => {
        if (currencyData[code]) {
            const option = createCurrencyOption(code, currencyData[code]);
            popularGroup.appendChild(option);
        }
    });
    
    fromCurrencySelect.appendChild(popularGroup.cloneNode(true));
    toCurrencySelect.appendChild(popularGroup.cloneNode(true));
    
    // Then add all other currencies
    const allGroup = document.createElement('optgroup');
    allGroup.label = 'All Currencies';
    
    Object.entries(currencyData)
        .filter(([code]) => !POPULAR_CURRENCIES.includes(code))
        .sort((a, b) => a[1].localeCompare(b[1]))
        .forEach(([code, name]) => {
            const option = createCurrencyOption(code, name);
            allGroup.appendChild(option);
        });
    
    fromCurrencySelect.appendChild(allGroup.cloneNode(true));
    toCurrencySelect.appendChild(allGroup.cloneNode(true));
}

/**
 * Create a currency option element
 * @param {string} code - Currency code
 * @param {string} name - Currency name
 * @returns {HTMLOptionElement} The option element
 */
function createCurrencyOption(code, name) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = `${code} - ${name}`;
    return option;
}

/**
 * Fetch exchange rates from the API
 * @param {string} baseCurrency - The base currency to get rates for
 */
async function fetchExchangeRates(baseCurrency) {
    try {
        const response = await fetch(`${API_URL}/latest?base=${baseCurrency}`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Failed to fetch exchange rates');
        }
        
        // Store the exchange rates
        exchangeRates[baseCurrency] = data.rates;
        
        // Store the last updated time
        lastUpdated = new Date(data.date);
    } catch (error) {
        throw new Error(`Failed to fetch exchange rates: ${error.message}`);
    }
}

/**
 * Check if the rates are expired (older than 1 hour)
 * @returns {boolean} True if rates are expired
 */
function isRatesExpired() {
    if (!lastUpdated) return true;
    
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    const now = new Date();
    
    return (now - lastUpdated) > oneHour;
}

/**
 * Perform the currency conversion and display the result
 */
function performConversion() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    if (!amount || !fromCurrency || !toCurrency) {
        return;
    }
    
    // Get the exchange rate
    const rate = exchangeRates[fromCurrency][toCurrency];
    
    if (!rate) {
        showError(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
        return;
    }
    
    // Calculate the converted amount
    const convertedAmount = amount * rate;
    
    // Display the result
    displayResult(amount, fromCurrency, convertedAmount, toCurrency, rate);
}

/**
 * Display the conversion result
 * @param {number} amount - The original amount
 * @param {string} fromCurrency - The source currency
 * @param {number} convertedAmount - The converted amount
 * @param {string} toCurrency - The target currency
 * @param {number} rate - The exchange rate used
 */
function displayResult(amount, fromCurrency, convertedAmount, toCurrency, rate) {
    // Format numbers with appropriate decimal places
    const formattedAmount = formatCurrency(amount, fromCurrency);
    const formattedConverted = formatCurrency(convertedAmount, toCurrency);
    
    // Show the result
    conversionResult.textContent = `${formattedAmount} = ${formattedConverted}`;
    conversionRate.textContent = `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`;
    
    if (lastUpdated) {
        lastUpdatedElement.textContent = `Last updated: ${formatDate(lastUpdated)}`;
    }
    
    // Show the result container with animation
    resultContainer.classList.remove('d-none');
    resultContainer.classList.add('fade-in');
    
    // Save the conversion to history
    saveConversionToHistory(amount, fromCurrency, convertedAmount, toCurrency, rate);
}

/**
 * Format a currency value with the appropriate number of decimal places
 * @param {number} value - The value to format
 * @param {string} currencyCode - The currency code
 * @returns {string} The formatted currency string
 */
function formatCurrency(value, currencyCode) {
    let formatter;
    try {
        formatter = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: 2
        });
        return formatter.format(value);
    } catch (error) {
        // Fallback for unsupported currency codes
        return `${value.toFixed(2)} ${currencyCode}`;
    }
}

/**
 * Format a date for display
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 */
function formatDate(date) {
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Show or hide the loading indicator
 * @param {boolean} isLoading - Whether loading is in progress
 */
function showLoading(isLoading) {
    if (isLoading) {
        loadingContainer.classList.remove('d-none');
    } else {
        loadingContainer.classList.add('d-none');
    }
}

/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('d-none');
}

/**
 * Hide the error message
 */
function hideError() {
    errorContainer.textContent = '';
    errorContainer.classList.add('d-none');
}

/**
 * Save conversion to database
 * @param {number} amount - The original amount
 * @param {string} fromCurrency - The source currency
 * @param {number} convertedAmount - The converted amount
 * @param {string} toCurrency - The target currency
 * @param {number} rate - The exchange rate used
 */
async function saveConversionToHistory(amount, fromCurrency, convertedAmount, toCurrency, rate) {
    try {
        const response = await fetch('/api/conversions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount,
                fromCurrency,
                toCurrency,
                rate,
                convertedAmount
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        // Reload conversion history
        loadConversionHistory();
    } catch (error) {
        console.error('Error saving conversion history:', error);
    }
}

/**
 * Load conversion history from database
 */
async function loadConversionHistory() {
    try {
        const response = await fetch('/api/conversions');
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const history = await response.json();
        
        if (history.length === 0) {
            // No history available
            historyContainer.classList.add('d-none');
            noHistoryElement.classList.remove('d-none');
            return;
        }
        
        // Display history
        displayConversionHistory(history);
    } catch (error) {
        console.error('Error loading conversion history:', error);
        historyContainer.classList.add('d-none');
        noHistoryElement.classList.remove('d-none');
        noHistoryElement.textContent = `Error loading history: ${error.message}`;
    }
}

/**
 * Display conversion history
 * @param {Array} history - Array of conversion history records
 */
function displayConversionHistory(history) {
    // Clear existing history
    historyTableBody.innerHTML = '';
    
    // Add each history record to the table
    history.forEach(record => {
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(record.created_at);
        const formattedDate = formatDate(date);
        
        row.innerHTML = `
            <td>${record.from_currency}</td>
            <td>${record.to_currency}</td>
            <td>${formatCurrency(record.amount, record.from_currency)}</td>
            <td>${formatCurrency(record.converted_amount, record.to_currency)}</td>
            <td>${formattedDate}</td>
        `;
        
        historyTableBody.appendChild(row);
    });
    
    // Show history container, hide no history message
    historyContainer.classList.remove('d-none');
    noHistoryElement.classList.add('d-none');
}