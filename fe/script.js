document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const urlInput = document.getElementById('url-input');
    const scrapeButton = document.getElementById('scrape-button');
    const statusMessage = document.getElementById('status-message');
    const loadingSpinner = document.getElementById('loading-spinner');
    const downloadSection = document.getElementById('download-section');
    const downloadButton = document.getElementById('download-button');
    
    // Store scraped data
    let scrapedData = null;
    
    // Event listener for scrape button
    scrapeButton.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        
        // Basic validation
        if (!url) {
            showError('Please enter a valid URL');
            return;
        }
        
        if (!isValidUrl(url)) {
            showError('Please enter a valid URL including http:// or https://');
            return;
        }
        
        // Clear previous state
        statusMessage.textContent = '';
        downloadSection.style.display = 'none';
        
        // Show loading spinner
        loadingSpinner.style.display = 'block';
        
        try {
            // Make API call to backend scraping service
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });
            
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to scrape the website');
            }
            
            // Get scraped data
            const data = await response.json();
            scrapedData = data.content;
            
            // Show download section
            downloadSection.style.display = 'block';
            
        } catch (error) {
            loadingSpinner.style.display = 'none';
            showError(error.message || 'An error occurred during scraping');
        }
    });
    
    // Event listener for download button
    downloadButton.addEventListener('click', () => {
        if (!scrapedData) {
            showError('No data available for download');
            return;
        }
        
        // Create and download file
        downloadTextFile(scrapedData, getFileNameFromUrl(urlInput.value.trim()));
    });
    
    // Helper function to validate URL
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // Helper function to show error message
    function showError(message) {
        statusMessage.textContent = message;
    }
    
    // Helper function to download text as file
    function downloadTextFile(content, fileName) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = fileName || 'scraped-data.txt';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Helper function to generate filename from URL
    function getFileNameFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.replace(/[^a-z0-9]/gi, '-');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            return `${hostname}-${timestamp}.txt`;
        } catch (_) {
            return `scraped-data-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
        }
    }
}); 