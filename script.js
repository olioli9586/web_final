// Dark mode switch functionality
const darkModeSwitch = document.getElementById('dark-mode-switch');
const body = document.body;

darkModeSwitch.addEventListener('change', () => {
  if (darkModeSwitch.checked) {
    body.classList.add('dark-mode');
    localStorage.setItem('darkModeEnabled', 'true');
    updateRowColors(true); // Update row colors for dark mode
  } else {
    body.classList.remove('dark-mode');
    localStorage.setItem('darkModeEnabled', 'false');
    updateRowColors(false); // Update row colors for light mode
  }
});

// Check local storage for dark mode preference on page load
const darkModeEnabled = localStorage.getItem('darkModeEnabled') === 'true';
darkModeSwitch.checked = darkModeEnabled;
if (darkModeEnabled) {
  body.classList.add('dark-mode');
  updateRowColors(true); // Update row colors for dark mode
}

// Function to load the portfolio from local storage
function loadPortfolioFromStorage() {
  const savedPortfolio = localStorage.getItem('portfolio');
  if (savedPortfolio) {
    const portfolio = JSON.parse(savedPortfolio);
    for (const stock of portfolio) {
      addStockToPortfolio(stock.symbol, stock.quantity, stock.purchasePrice);
    }
  }
}

// Function to update row colors based on dark mode state
function updateRowColors(darkModeEnabled) {
    const rows = document.querySelectorAll('#portfolio-rows tr');
    rows.forEach(row => {
      const profitLossCell = row.querySelector('.profit-loss');
      const profitLoss = parseFloat(profitLossCell.textContent);
      if (profitLoss > 0) {
        profitLossCell.style.color = darkModeEnabled ? 'limegreen' : 'green';
      } else if (profitLoss < 0) {
        profitLossCell.style.color = darkModeEnabled ? 'red' : 'darkred';
      } else {
        profitLossCell.style.color = '';
      }
    });
  }

  
// Function to save the portfolio to local storage
function savePortfolioToStorage() {
    const portfolioTable = document.getElementById('portfolio-rows');
    const rows = portfolioTable.getElementsByTagName('tr');
    const portfolio = [];
    for (let i = 0; i < rows.length; i++) {
      const symbolCell = rows[i].getElementsByTagName('td')[0];
      const quantityCell = rows[i].getElementsByTagName('td')[1];
      const purchasePriceCell = rows[i].getElementsByTagName('td')[2];
      const stock = {
        symbol: symbolCell.textContent,
        quantity: parseInt(quantityCell.textContent),
        purchasePrice: parseFloat(purchasePriceCell.textContent)
      };
      portfolio.push(stock);
    }
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  }
  
// Function to calculate the total portfolio value
function calculatePortfolioValue() {
    const rows = document.querySelectorAll('#portfolio-rows tr');
    let totalValue = 0;
    let totalProfitLoss = 0; // Track the total profit/loss
    rows.forEach(row => {
      const quantity = parseInt(row.querySelector('td:nth-child(2)').textContent);
      const currentPrice = parseFloat(row.querySelector('.current-price').textContent);
      const profitLoss = calculateProfitLoss(row); // Get the profit/loss value
      if (!isNaN(quantity) && !isNaN(currentPrice)) {
        const stockValue = quantity * currentPrice;
        totalValue += stockValue;
        totalProfitLoss += profitLoss; // Add the profit/loss to the total
      }
    });
    const portfolioValueElement = document.getElementById('portfolio-value');
    portfolioValueElement.textContent = totalProfitLoss.toFixed(2); // Use the total profit/loss
  }
  
  // Function to search for stocks
  function searchStock(stockSymbol) {
    const apiKey = 'YOUR_API_KEY'; // Replace with your Alpha Vantage API key
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${apiKey}`;
  
    // Make AJAX request to fetch stock data from Alpha Vantage API
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const searchResultsContainer = document.getElementById('search-results');
        if (data['Global Quote']) {
          const stockData = data['Global Quote'];
          const stockInfo = `
            <h3>${stockData['01. symbol']}</h3>
            <p>Open: ${stockData['02. open']}</p>
            <p>High: ${stockData['03. high']}</p>
            <p>Low: ${stockData['04. low']}</p>
            <p>Price: ${stockData['05. price']}</p>
            <p>Volume: ${stockData['06. volume']}</p>
            <p>Last Trading Day: ${stockData['07. latest trading day']}</p>
            <p>Previous Close: ${stockData['08. previous close']}</p>
            <p>Change: ${stockData['09. change']}</p>
            <p>Change Percent: ${stockData['10. change percent']}</p>
          `;
          searchResultsContainer.innerHTML = stockInfo;
        } else {
          searchResultsContainer.innerHTML = `<p>No stock data found for symbol ${stockSymbol}</p>`;
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  
// Function to add a stock to the portfolio
function addStockToPortfolio(stockSymbol, quantity, purchasePrice) {
    const portfolioTable = document.getElementById('portfolio-rows');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${stockSymbol}</td>
      <td>${quantity}</td>
      <td>${purchasePrice}</td>
      <td class="current-price">Loading...</td>
      <td class="profit-loss">Loading...</td>
      <td><button class="remove-btn">Remove</button></td>
    `;
    portfolioTable.appendChild(row);
  
    // Fetch the current stock price and update the portfolio table
    fetchStockPrice(stockSymbol, row)
      .then(() => {
        // Calculate the profit/loss after fetching the stock price
        calculateProfitLoss(row);
        calculatePortfolioValue();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  
      calculatePortfolioValue();

      // Remove the 'hidden' class from the portfolio header
      const portfolioHeader = document.getElementById('portfolio-header');
      if (portfolioHeader.classList.contains('hidden')) {
        portfolioHeader.classList.remove('hidden');
      }
  }
  
  // Function to fetch the current stock price
  function fetchStockPrice(stockSymbol, row) {
    const apiKey = 'A0GXKO69N5ZTLGNK'; // Replace with your Alpha Vantage API key
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${apiKey}`;
  
    return fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data['Global Quote']) {
          const currentPriceCell = row.getElementsByClassName('current-price')[0];
          const stockData = data['Global Quote'];
          const currentPrice = parseFloat(stockData['05. price']);
          currentPriceCell.textContent = currentPrice.toFixed(2);
        }
      });
  }
  

// Function to calculate the profit/loss for a stock in the portfolio
function calculateProfitLoss(row) {
    const quantity = parseInt(row.querySelector('td:nth-child(2)').textContent);
    const purchasePrice = parseFloat(row.querySelector('td:nth-child(3)').textContent);
    const currentPrice = parseFloat(row.querySelector('.current-price').textContent);
    const profitLossCell = row.querySelector('.profit-loss');
  
    if (!isNaN(quantity) && !isNaN(purchasePrice) && !isNaN(currentPrice)) {
      const profitLoss = (currentPrice - purchasePrice) * quantity;
      profitLossCell.textContent = profitLoss.toFixed(2);
      if (profitLoss > 0) {
        profitLossCell.style.color = 'green';
      } else if (profitLoss < 0) {
        profitLossCell.style.color = 'red';
      }
      return profitLoss; // Return the profit/loss value
    }
    return 0; // Return 0 if any of the values are NaN
  }

// Function to remove a stock from the portfolio
function removeStockFromPortfolio(button) {
    const row = button.closest('tr');
    const symbolCell = row.getElementsByTagName('td')[0];
    const stockSymbol = symbolCell.textContent;
  
    row.remove();
  
    // Save the updated portfolio to local storage
    savePortfolioToStorage();
  
    // Check if the portfolio is empty and add the 'hidden' class to the portfolio header
    const portfolioRows = document.getElementById('portfolio-rows');
    const portfolioHeader = document.getElementById('portfolio-header');
    if (portfolioRows.childElementCount === 0) {
      portfolioHeader.classList.add('hidden');
    }
  
    // Calculate the total portfolio value
    calculatePortfolioValue();
  }
  
  // Stock search form submission
  document.getElementById('stock-search-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission
    const stockSymbolInput = document.getElementById('stock-symbol');
    const stockSymbol = stockSymbolInput.value.toUpperCase();
  
    // Call function to fetch stock data
    searchStock(stockSymbol);
    stockSymbolInput.value = ''; // Clear input field
  });
  
  // Add to portfolio form submission
  document.getElementById('add-to-portfolio-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission
    const portfolioStockSymbolInput = document.getElementById('portfolio-stock-symbol');
    const portfolioQuantityInput = document.getElementById('portfolio-quantity');
    const purchasePriceInput = document.getElementById('purchase-price');
    const stockSymbol = portfolioStockSymbolInput.value.toUpperCase();
    const quantity = parseInt(portfolioQuantityInput.value);
    const purchasePrice = parseFloat(purchasePriceInput.value);
  
    // Call function to add stock to portfolio
    addStockToPortfolio(stockSymbol, quantity, purchasePrice);
    portfolioStockSymbolInput.value = ''; // Clear stock symbol input field
    portfolioQuantityInput.value = ''; // Clear quantity input field
    purchasePriceInput.value = ''; // Clear purchase price input field
  
    // Save the updated portfolio to local storage
    savePortfolioToStorage();
  });
  
  // Portfolio Management: Event delegation for removing stocks
  document.getElementById('portfolio-rows').addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-btn')) {
      removeStockFromPortfolio(e.target);
    }
  });
  
  // Load the portfolio from local storage when the page loads
  loadPortfolioFromStorage();
  
  // Calculate the total portfolio value when the page loads
  calculatePortfolioValue();
  