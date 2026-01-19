const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class BrowserService {
    async capturePageData(url) {
        console.log('🕵️‍♂️ [BrowserAgent] Launching Headless Browser for:', url);
        let browser = null;
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Set Viewport to 1080p for good screenshot
            await page.setViewport({ width: 1920, height: 1080 });

            console.log('🕵️‍♂️ [BrowserAgent] Navigating...');
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Try to click "more" to expand description
            try {
                // Selector strategy for YouTube "more" button
                const moreSelector = '#expand';
                // Sometimes it's inside ytd-text-inline-expander
                await page.waitForSelector(moreSelector, { timeout: 5000 });
                await page.click(moreSelector);
                console.log('🕵️‍♂️ [BrowserAgent] Expanded description.');
                // Wait a bit for animation
                await new Promise(r => setTimeout(r, 500));
            } catch (e) {
                console.warn('⚠️ [BrowserAgent] Could not expand description (might be already visible or different layout):', e.message);
            }

            // Extract Data
            const pageData = await page.evaluate(async () => {
                const titleEl = document.querySelector('h1.ytd-video-primary-info-renderer');
                const title = titleEl ? titleEl.innerText.trim() : document.title;

                // Description selector
                const descEl = document.querySelector('#description-inline-expander') || document.querySelector('#description');
                const description = descEl ? descEl.innerText.trim() : '';

                // [NEW] Attempt to extract Transcript via Innertube (ytInitialPlayerResponse)
                let transcript = null;
                try {
                    const playerResponse = window.ytInitialPlayerResponse;
                    if (playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
                        const tracks = playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
                        if (tracks.length > 0) {
                            // Prefer Portuguese
                            const track = tracks.find(t => t.languageCode.includes('pt')) || tracks[0];
                            console.log('📜 Found caption track:', track.name.simpleText);

                            // Fetch content
                            const response = await fetch(track.baseUrl);
                            const xml = await response.text();

                            // Parse XML
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(xml, "text/xml");
                            const texts = Array.from(xmlDoc.getElementsByTagName('text')).map(n => n.textContent).join(' ');
                            transcript = texts;
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Transcript extraction failed inside page:', e.message);
                }

                return { title, description, transcript };
            });

            console.log('🕵️‍♂️ [BrowserAgent] Data Extracted:', pageData.title);
            if (pageData.transcript) console.log('📜 [BrowserAgent] Transcript extracted successfully!');

            // Take Screenshot
            const timestamp = Date.now();
            const screenshotPath = path.join(__dirname, `../uploads/yt_screenshot_${timestamp}.png`);

            // Ensure dir exists
            if (!fs.existsSync(path.dirname(screenshotPath))) {
                fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
            }

            await page.screenshot({ path: screenshotPath });
            console.log('📸 [BrowserAgent] Screenshot saved:', screenshotPath);

            return {
                title: pageData.title,
                description: pageData.description,
                screenshotPath
            };

        } catch (error) {
            console.error('❌ [BrowserAgent] Error:', error);
            throw error;
        } finally {
            if (browser) await browser.close();
        }
    }
}

module.exports = new BrowserService();
