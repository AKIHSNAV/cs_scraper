from playwright.sync_api import sync_playwright
import os
from datetime import datetime
import json

def scrape_interactive_page(url, output_dir="scraped_pages"):
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    with sync_playwright() as playwright:
        try:
            # Launch browser
            browser = playwright.chromium.launch(headless=False)
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            page = context.new_page()
            
            # Navigate to the page
            print(f"Accessing {url}...")
            page.goto(url, wait_until='networkidle', timeout=60000)
            page.wait_for_timeout(3000)
            
            # Get initial HTML
            initial_html = page.content()
            with open(os.path.join(output_dir, f"initial_page_{timestamp}.html"), 'w', encoding='utf-8') as f:
                f.write(initial_html)
            
            # Find all clickable elements (tabs, buttons)
            clickable_elements = page.evaluate('''() => {
                // Function to check if element is visible
                function isVisible(elem) {
                    return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
                }
                
                // Get all potentially clickable elements
                const elements = Array.from(document.querySelectorAll(
                    'button, [role="tab"], .tab, .nav-link, [data-toggle="tab"], a[href="#"]'
                ));
                
                return elements
                    .filter(el => isVisible(el))
                    .map(el => ({
                        text: el.textContent.trim(),
                        tagName: el.tagName.toLowerCase(),
                        className: el.className,
                        id: el.id,
                        selector: el.id ? `#${el.id}` : 
                                el.className ? `.${el.className.split(' ').join('.')}` :
                                el.tagName.toLowerCase()
                    }));
            }''')
            
            # Save information about clickable elements
            with open(os.path.join(output_dir, f"clickable_elements_{timestamp}.json"), 'w') as f:
                json.dump(clickable_elements, f, indent=4)
            
            # Click each element and capture content
            for idx, element in enumerate(clickable_elements):
                try:
                    print(f"Clicking element: {element['text']}")
                    
                    # Try different selectors
                    try:
                        if element['id']:
                            page.click(f"#{element['id']}")
                        elif element['className']:
                            page.click(f".{element['className'].split(' ')[0]}")
                        else:
                            page.click(f"//*[text()='{element['text']}']")
                    except:
                        print(f"Could not click element: {element['text']}")
                        continue
                    
                    # Wait for any dynamic content to load
                    page.wait_for_timeout(2000)
                    
                    # Capture the new state
                    content = page.content()
                    with open(os.path.join(output_dir, f"content_after_click_{idx}_{element['text'].replace(' ', '_')}_{timestamp}.html"), 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    # Also capture any visible tables
                    tables = page.evaluate('''() => {
                        const tables = Array.from(document.querySelectorAll('table'));
                        return tables.map(table => table.outerHTML);
                    }''')
                    
                    if tables:
                        with open(os.path.join(output_dir, f"tables_after_click_{idx}_{element['text'].replace(' ', '_')}_{timestamp}.html"), 'w', encoding='utf-8') as f:
                            f.write("\n".join(tables))
                    
                except Exception as e:
                    print(f"Error processing element {element['text']}: {str(e)}")
                    continue
            
            print(f"Scraping completed. Check {output_dir} for all captured content")
            
        except Exception as e:
            print(f"Error occurred: {str(e)}")
        finally:
            browser.close()

# Example usage
if __name__ == "__main__":
    url = "https://www.bseindia.com/markets.html"
    scrape_interactive_page(url)