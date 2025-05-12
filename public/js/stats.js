// Currency Statistics Application

// DOM Elements
const historyTableBody = document.getElementById('history-table-body');
const noHistoryElement = document.getElementById('no-history');
const loadingContainer = document.getElementById('loading-container');
const errorContainer = document.getElementById('error-container');

// Chart instances
let popularPairsChart = null;
let conversionVolumeChart = null;
let currencyDistributionChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeStats();
});

/**
 * Initialize the statistics page
 */
async function initializeStats() {
    try {
        showLoading(true);
        
        // Load conversion history and stats
        await loadConversionHistory();
        await loadConversionStats();
        
        showLoading(false);
    } catch (error) {
        showError(`Failed to initialize stats: ${error.message}`);
        showLoading(false);
    }
}

/**
 * Load conversion history from database
 */
async function loadConversionHistory() {
    try {
        const response = await fetch('/api/conversions?limit=20');
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const history = await response.json();
        
        if (history.length === 0) {
            // No history available
            noHistoryElement.classList.remove('d-none');
            return;
        }
        
        // Display history
        displayConversionHistory(history);
    } catch (error) {
        console.error('Error loading conversion history:', error);
        noHistoryElement.classList.remove('d-none');
        noHistoryElement.textContent = `Error loading history: ${error.message}`;
    }
}

/**
 * Load conversion statistics
 */
async function loadConversionStats() {
    try {
        // Fetch pair stats
        const statsResponse = await fetch('/api/stats');
        
        if (!statsResponse.ok) {
            throw new Error(`Error fetching stats: ${statsResponse.status}`);
        }
        
        const stats = await statsResponse.json();
        
        // Fetch distribution data
        const distributionResponse = await fetch('/api/distribution');
        
        if (!distributionResponse.ok) {
            throw new Error(`Error fetching distribution: ${distributionResponse.status}`);
        }
        
        const distribution = await distributionResponse.json();
        
        // Create charts
        if (stats.length > 0) {
            createPopularPairsChart(stats);
            createConversionVolumeChart(stats);
        }
        
        if (distribution.length > 0) {
            createCurrencyDistributionChart(distribution);
        }
    } catch (error) {
        console.error('Error loading conversion stats:', error);
        showError(`Failed to load statistics: ${error.message}`);
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
}

/**
 * Create popular currency pairs chart
 * @param {Array} stats - Array of conversion statistics
 */
function createPopularPairsChart(stats) {
    const ctx = document.getElementById('popular-pairs-chart').getContext('2d');
    
    // Prepare data
    const labels = stats.map(item => `${item.from_currency} → ${item.to_currency}`);
    const data = stats.map(item => item.count);
    
    // Generate random colors
    const backgroundColors = generateRandomColors(stats.length);
    
    // Destroy existing chart if it exists
    if (popularPairsChart) {
        popularPairsChart.destroy();
    }
    
    // Create new chart
    popularPairsChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Conversion Count',
                data: data,
                backgroundColor: backgroundColors
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

/**
 * Create conversion volume chart
 * @param {Array} stats - Array of conversion statistics
 */
function createConversionVolumeChart(stats) {
    const ctx = document.getElementById('conversion-volume-chart').getContext('2d');
    
    // Prepare data
    const labels = stats.map(item => `${item.from_currency} → ${item.to_currency}`);
    const data = stats.map(item => item.count);
    
    // Generate random colors
    const backgroundColors = generateRandomColors(stats.length);
    
    // Destroy existing chart if it exists
    if (conversionVolumeChart) {
        conversionVolumeChart.destroy();
    }
    
    // Create new chart
    conversionVolumeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Conversions',
                data: data,
                backgroundColor: backgroundColors
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

/**
 * Create currency distribution chart
 * @param {Array} distribution - Array of currency distribution statistics
 */
function createCurrencyDistributionChart(distribution) {
    const ctx = document.getElementById('currency-distribution-chart').getContext('2d');
    
    // Prepare data
    const labels = distribution.map(item => item.currency_code);
    const data = distribution.map(item => item.count);
    
    // Generate random colors
    const backgroundColors = generateRandomColors(distribution.length);
    
    // Destroy existing chart if it exists
    if (currencyDistributionChart) {
        currencyDistributionChart.destroy();
    }
    
    // Create new chart
    currencyDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Currency Usage',
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Most Used Currencies'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Generate random colors for charts
 * @param {number} count - Number of colors to generate
 * @returns {Array} Array of colors
 */
function generateRandomColors(count) {
    const colors = [];
    
    for (let i = 0; i < count; i++) {
        const hue = i * (360 / count);
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    
    return colors;
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