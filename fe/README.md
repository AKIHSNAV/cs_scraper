# Web Scraper Frontend

A simple web application that allows users to enter a URL, scrape the website, and download the scraped content as a text file.

## Features

- Clean, user-friendly interface
- Input validation for URLs
- Loading indicator during scraping
- Automatic file naming based on the scraped URL
- Download scraped data as a text file

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter a valid URL in the input field (must include http:// or https://)
2. Click the "Scrape" button
3. Wait for the scraping process to complete
4. Click "Download Text File" to save the scraped data

## Integrating with Your Backend

The current implementation includes a mock scraping service. To integrate with your actual scraping backend:

1. Modify the `/api/scrape` endpoint in `server.js` to call your scraping functions
2. Update the response format to match what the frontend expects:
   ```json
   {
     "success": true,
     "url": "https://example.com",
     "content": "Scraped text content..."
   }
   ```

## Customization

- Modify `styles.css` to change the appearance
- Update the UI components in `index.html`
- Extend the functionality in `script.js`

## License

MIT 