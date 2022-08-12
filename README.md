# Google search result webscraping
This repository demonstrates to scrape google search results.

This is useful when:
- We want to automate process to get google search results
- We need results for computers or algorithm because they understand text better
- We want to find URLs for web crawling

Since google is doing the hard work of searching best results on the internet based on keywords, hence, by extracting google search results, we'll hopefully get better results than typical webcrawling.

## How to run the code?
- Clone the repository using *"git clone"*
- In the root directory, install node packages using the command *"npm install"*
- Run the server using *"npm run start"* 
- Go to your browser and search *"localhost:3000/webscrape/:<keyword>"* and wait for around 20-25 seconds
- For example, you want to search for maths, then type *"localhost:3000/webscrape/:maths"*


## Takeaways
There are various takeaways in the complete code, let's see all of them.

### Scraping links using cheerio (DOM manipulations)
The code is returing links using DOM manipulation / jQuery / cheerio package, whatever you name it.

### Extracting text using OCR
The code is extracting text using OCR technique.

- The first step is to capture a screenshot, which is done using pupeeteer that simulates a browser.
- The second step is to extract text from that screenshot or image, that is done in the python file named ocr.py
- The third step is to collect and structure the text inside a file that is done in ocr.py which creates ocr.txt file that contains the text.

### Calling python file from nodejs
This code spawn a child process to run python file.
One should know to call and get data back from python files from nodejs because it helps in machine learning stuff communicated 

### Other 
Using the same concept, by just changing the url, and some string manipulations, useful webscraping of many webpages can be done.