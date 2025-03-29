document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const urlInput = document.getElementById('url-input');
    const scrapeButton = document.getElementById('scrape-button');
    const statusMessage = document.getElementById('status-message');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Sections
    const jsonSection = document.getElementById('json-section');
    const extractionSection = document.getElementById('extraction-section');
    const resultSection = document.getElementById('result-section');
    
    // Buttons and content
    const jsonResultSection = document.getElementById('json-result-section');
    const llmResultSection = document.getElementById('llm-result-section');
    const downloadJsonButton = document.getElementById('download-json-button');
    const downloadTextButton = document.getElementById('download-text-button');
    const extractionQuery = document.getElementById('extraction-query');
    const extractButton = document.getElementById('extract-button');
    const extractionContent = document.getElementById('extraction-content');
    const toggleJsonButton = document.getElementById('toggle-json');
    const jsonPreview = document.getElementById('json-preview');
    
    // Store scraped data
    let scrapedJsonData = null;
    let processedTextData = null;
    
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
        
        // Show loading spinner
        loadingSpinner.style.display = 'flex';
        
        try {
            // Make API call to backend scraping service with Selenium flag
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    url,
                    useSelenium: true // Flag to use Selenium on backend
                }),
            });
            
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to scrape the website');
            }
            
            // Get scraped data
            const data = await response.json();
            scrapedJsonData = data;
            
            // Update JSON preview
            jsonPreview.textContent = JSON.stringify(data, null, 2);
            
            // Show JSON section and extraction section
            jsonSection.style.display = 'block';
            extractionSection.style.display = 'block';
            
            // Scroll to JSON section
            jsonSection.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            loadingSpinner.style.display = 'none';
            showError(error.message || 'An error occurred during scraping');
        }
    });
    
    // Toggle JSON preview
    toggleJsonButton.addEventListener('click', () => {
        if (jsonPreview.style.display === 'block') {
            jsonPreview.style.display = 'none';
            toggleJsonButton.textContent = 'Preview JSON Data';
        } else {
            jsonPreview.style.display = 'block';
            toggleJsonButton.textContent = 'Hide JSON Data';
        }
    });
    
    // Event listener for extract button
    extractButton.addEventListener('click', async () => {
        const query = extractionQuery.value.trim();
        
        if (!query) {
            showError('Please specify what information you want to extract');
            return;
        }
        
        if (!scrapedJsonData) {
            showError('No scraped data available for extraction');
            return;
        }
        
        // Show loading spinner
        loadingSpinner.style.display = 'flex';
        
        try {
            // Make API call to LLM processing service
            const response = await fetch('/api/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    scrapedData: scrapedJsonData,
                    query: query
                }),
            });
            
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to extract information');
            }
            
            // Get processed data
            const data = await response.json();
            processedTextData = data.extractedContent;
            
            // Show extraction preview
            extractionContent.textContent = processedTextData;
            
            // Show result section
            resultSection.style.display = 'block';
            
            // Scroll to result section
            resultSection.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            loadingSpinner.style.display = 'none';
            showError(error.message || 'An error occurred during information extraction');
        }
    });
    
    // Event listener for download JSON button
    downloadJsonButton.addEventListener('click', () => {
        if (!scrapedJsonData) {
            showError('No JSON data available for download');
            return;
        }
        
        // Create and download JSON file
        const jsonString = JSON.stringify(scrapedJsonData, null, 2);
        downloadFile(jsonString, getFileNameFromUrl(urlInput.value.trim(), 'json'));
    });
    
    // Event listener for download text button
    downloadTextButton.addEventListener('click', () => {
        if (!processedTextData) {
            showError('No processed data available for download');
            return;
        }
        
        // Create and download text file
        downloadFile(processedTextData, getFileNameFromUrl(urlInput.value.trim(), 'txt'));
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
        statusMessage.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Helper function to download file
    function downloadFile(content, fileName) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Helper function to generate filename from URL
    function getFileNameFromUrl(url, extension) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.replace(/[^a-z0-9]/gi, '-');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            return `${hostname}-${timestamp}.${extension}`;
        } catch (_) {
            return `scraped-data-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
        }
    }
}); 