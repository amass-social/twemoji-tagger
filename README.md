# Amass Twemoji Scraper+Cleaner


The react part of this project was bootstrapped using create-react-app.
  - The original README is available at docs/create-react-app-README.md


This project has 2 main components
  1) a python web scraper that scrapes emojipedia.com for information about the twitter emoji dataset
  2) a React project that takes the output of the web scraper and makes it easy to visualize + manipulate the emojis. Specifically, it provides a GUI for grouping the emojis into different categories.


Pipeline from start to finish:
  1. run `python emojipedia_scraper.py` in /scripts.
    - this will output `emoji_definitions.json` and `emojipedia.html`
  2. move or copy `emoji_definitions.json` into src/emojis/ so the react project can see it
  3. make sure there is a `emoji_categories.json` in src/emojis.
    - the default content is `{"group1": []}`
  4. run the frontend using `npm start`. It will run on port 3000.
  5. create groups and select emojis into those groups.
  6. to save, press the "Copy JSON to clipboard" button on the left of the screen. Manually save that to a file.
  7. To load a saved groups session, make sure that the file is `src/emojis/emoji_categories.json`, then press "Load from JSON".


Troubleshooting
  - more to come here
