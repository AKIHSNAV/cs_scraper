const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for scraping
app.post('/api/scrape', async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ message: 'URL is required in the JSON payload' });
        }
        
        // Mock scraping functionality
        // In a real application, this is where you would call your scraping logic
        console.log(`Processing scrape request for URL: ${url}`);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Return mock data
        // Replace this with actual scraping functionality
        const mockScrapedContent = generateMockData(url);
        
        res.json({
            success: true,
            url,
            content: mockScrapedContent
        });
        
    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while scraping the website'
        });
    }
});

// Helper function to generate mock data
function generateMockData(url) {
    const date = new Date().toISOString();
    return `Scraped content from ${url}\n\nTimestamp: ${date}\n\nThis is mock data for demonstration purposes.\nIn a real application, this would contain the actual scraped content from the website.\n\nExample content:\n- Website title: Example Website\n- Main headings: 5\n- Paragraphs: 12\n- Links: 24\n\nRaw text content would appear here...`;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 