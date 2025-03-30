const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '/')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for scraping with Selenium option
app.post('/api/scrape', async (req, res) => {
    try {
        console.log('Received scrape request');
        const { url, useSelenium } = req.body;
        
        if (!url) {
            return res.status(400).json({ message: 'URL is required in the JSON payload' });
        }
        
        console.log(`Processing scrape request for URL: ${url} using ${useSelenium ? 'Selenium' : 'standard method'}`);
        
        // Simulate processing time for demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Return mock data - in real implementation this would use Selenium
        const mockScrapedContent = generateMockJsonData(url, useSelenium);
        
        res.json(mockScrapedContent);
        
    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while scraping the website'
        });
    }
});

// API endpoint for LLM extraction
app.post('/api/extract', async (req, res) => {
    try {
        console.log('Received extraction request');
        const { scrapedData, query } = req.body;
        
        if (!scrapedData || !query) {
            return res.status(400).json({ 
                message: 'Both scraped data and query are required' 
            });
        }
        
        console.log(`Processing extraction request with query: "${query}"`);
        
        // Simulate LLM processing time for demo
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Mock LLM extraction (this would call a real LLM in production)
        const extractedContent = generateMockExtraction(scrapedData, query);
        
        res.json({
            success: true,
            query,
            extractedContent
        });
        
    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during information extraction'
        });
    }
});

// Helper function to generate mock JSON data for the Selenium scraper
function generateMockJsonData(url, useSelenium) {
    const date = new Date().toISOString();
    const method = useSelenium ? 'Selenium WebDriver' : 'Standard HTTP';
    
    // Try to extract domain for more realistic mock data
    let domain = "example.com";
    try {
        const urlObj = new URL(url);
        domain = urlObj.hostname;
    } catch (e) {
        console.log("Could not parse URL for domain");
    }
    
    return {
        success: true,
        url,
        timestamp: date,
        method: method,
        metadata: {
            title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} - Homepage`,
            description: `This is a meta description from ${domain}`,
            language: "en-US",
            lastUpdated: date.split('T')[0]
        },
        stats: {
            headings: {
                h1: 2,
                h2: 8,
                h3: 15
            },
            paragraphs: 24,
            links: 38,
            images: 12,
            tables: 3,
            forms: 2
        },
        content: {
            headings: [
                { type: "h1", text: `Welcome to ${domain}` },
                { type: "h2", text: "Our Products" },
                { type: "h2", text: "About Us" },
                { type: "h2", text: "Contact Information" }
            ],
            mainText: `This is example text content from ${domain}. It would contain much more information in a real scrape.`,
            links: [
                { text: "Home", url: "#home" },
                { text: "Products", url: "#products" },
                { text: "About", url: "#about" },
                { text: "Contact", url: "#contact" }
            ],
            images: [
                { alt: "Logo", src: "/images/logo.png" },
                { alt: "Product Image", src: "/images/product.jpg" }
            ],
            tables: [
                {
                    headers: ["Product", "Price", "Availability"],
                    rows: [
                        ["Product A", "$19.99", "In Stock"],
                        ["Product B", "$24.99", "Out of Stock"],
                        ["Product C", "$15.99", "In Stock"]
                    ]
                }
            ],
            contactInfo: {
                email: `info@${domain}`,
                phone: "+1 (555) 123-4567",
                address: "123 Main Street, Anytown, USA"
            }
        },
        performance: {
            loadTime: "1.2s",
            resourceCount: 45,
            javascriptFiles: 12,
            cssFiles: 5
        }
    };
}

// Helper function for mock LLM extraction
function generateMockExtraction(data, query) {
    // Simple mock that would be replaced with actual LLM processing
    let result = `EXTRACTION RESULTS FOR: "${query}"\n\n`;
    const queryLower = query.toLowerCase();
    
    // Very basic keyword matching to simulate LLM
    if (queryLower.includes('product') || queryLower.includes('price')) {
        result += "PRODUCTS INFORMATION:\n\n";
        if (data.content && data.content.tables && data.content.tables.length > 0) {
            const productTable = data.content.tables[0];
            result += "Product List:\n";
            for (let i = 0; i < productTable.rows.length; i++) {
                const row = productTable.rows[i];
                result += `- ${row[0]}: ${row[1]} (${row[2]})\n`;
            }
        }
    } else if (queryLower.includes('contact') || queryLower.includes('email') || queryLower.includes('phone')) {
        result += "CONTACT INFORMATION:\n\n";
        if (data.content && data.content.contactInfo) {
            const contact = data.content.contactInfo;
            result += "The following contact information was found:\n";
            result += `- Email: ${contact.email}\n`;
            result += `- Phone: ${contact.phone}\n`;
            result += `- Address: ${contact.address}\n\n`;
        } else {
            result += "Based on the webpage content, the following contact information was found:\n";
            result += "- Website has a Contact section but no specific contact details were identified\n";
            result += "- A contact link was found: Contact (#contact)\n";
        }
    } else if (queryLower.includes('image') || queryLower.includes('picture') || queryLower.includes('photo')) {
        result += "IMAGE INFORMATION:\n\n";
        result += "The following images were found on the webpage:\n";
        if (data.content && data.content.images) {
            data.content.images.forEach((img, index) => {
                result += `${index + 1}. ${img.alt || 'Unnamed image'}: ${img.src}\n`;
            });
        }
    } else if (queryLower.includes('header') || queryLower.includes('heading') || queryLower.includes('title')) {
        result += "HEADING INFORMATION:\n\n";
        if (data.content && data.content.headings) {
            result += "Main headings found on the page:\n";
            data.content.headings.forEach((heading, index) => {
                result += `${index + 1}. ${heading.type}: ${heading.text}\n`;
            });
        }
    } else if (queryLower.includes('performance') || queryLower.includes('speed') || queryLower.includes('load')) {
        result += "PERFORMANCE INFORMATION:\n\n";
        if (data.performance) {
            const perf = data.performance;
            result += "Website performance metrics:\n";
            result += `- Load Time: ${perf.loadTime}\n`;
            result += `- Resource Count: ${perf.resourceCount}\n`;
            result += `- JavaScript Files: ${perf.javascriptFiles}\n`;
            result += `- CSS Files: ${perf.cssFiles}\n`;
        }
    } else if (queryLower.includes('all')) {
        result += "COMPREHENSIVE WEBSITE INFORMATION:\n\n";
        result += `URL: ${data.url}\n`;
        result += `Title: ${data.metadata.title}\n`;
        result += `Description: ${data.metadata.description}\n\n`;
        
        result += "Content Statistics:\n";
        result += `- Headings: ${data.stats.headings.h1 + data.stats.headings.h2 + data.stats.headings.h3} total\n`;
        result += `- Paragraphs: ${data.stats.paragraphs}\n`;
        result += `- Links: ${data.stats.links}\n`;
        result += `- Images: ${data.stats.images}\n\n`;
        
        if (data.content && data.content.contactInfo) {
            const contact = data.content.contactInfo;
            result += "Contact Information:\n";
            result += `- Email: ${contact.email}\n`;
            result += `- Phone: ${contact.phone}\n`;
            result += `- Address: ${contact.address}\n\n`;
        }
        
        if (data.content && data.content.tables && data.content.tables.length > 0) {
            const productTable = data.content.tables[0];
            result += "Product Information:\n";
            for (let i = 0; i < productTable.rows.length; i++) {
                const row = productTable.rows[i];
                result += `- ${row[0]}: ${row[1]} (${row[2]})\n`;
            }
        }
    } else {
        result += "GENERAL INFORMATION:\n\n";
        result += `Page Title: ${data.metadata ? data.metadata.title : 'Unknown'}\n`;
        result += `Description: ${data.metadata ? data.metadata.description : 'Not available'}\n\n`;
        result += "Content Summary:\n";
        result += `- The page contains ${data.stats.headings.h1} main headings and ${data.stats.headings.h2} subheadings\n`;
        result += `- There are ${data.stats.paragraphs} paragraphs of text\n`;
        result += `- The page has ${data.stats.links} links and ${data.stats.images} images\n`;
    }
    
    result += "\n-----\n";
    result += "Note: This extraction was performed by an automated system using AI processing.\n";
    result += `Timestamp: ${new Date().toISOString()}`;
    
    return result;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 