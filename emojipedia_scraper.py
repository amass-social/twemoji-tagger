# ==============================================================================
# About: emojipedia_scraper.py
# ==============================================================================
# Problem:
#   - twemoji doesn't have a good list of its own emojis (emoji name -> emoji -> url)
#   - this makes it difficult to use / search
# Solution
#   - emojipedia has a webpage with a list of all the twemojis (https://emojipedia.org/twitter/)
#   - this script scrapes that info and turns it into a usable format and saves it

# Imports ----------------------------------------------------------------------

import re
import sys
import time
import json
import requests


# Constants --------------------------------------------------------------------

# link: https://regex101.com/r/7Qpivk/1
LISTING_PATTERN    = r'<li class="lazyparent">\s<a href="(.+)">\s<img class=.lazyload\s.\s.+alt="(.+)" title.+height="72">'
EMOJI_PATTERN      = r'<span class="copy-paste__label">Copy and paste this emoji:<\/span>\s<input type="text" value="(.+)" readonly'
SHORTCODES_PATTERN = r'<span class="shortcode">:(.+):</span>'
UNICODE_PATTERN    = r'<h2>Codepoints<\/h2>\s<ul>\s<li><a href=".+">.+\s(U\+.+)<\/a><\/li>\s<li>.+(U\+.+)<\/a>'

BASE_URL = 'https://emojipedia.org/twitter/'

# Main -------------------------------------------------------------------------


def main():

    emojis_by_title = {}


    # 1) grab a list of links to all the emojis on their index
    r = requests.get(BASE_URL)
    results = []
    for match in re.finditer(LISTING_PATTERN, r.text):
        groups = match.groups()
        results.append({'href': groups[0], 'title': groups[1]})


    # 2) for each emoji, go to the dedicated emoji page and grab the emoji itself
    for i in range(len(results)):

        # initialize the emoji obj
        emoji_obj = {
            'href'      : results[i]['href'],
            'title'     : results[i]['title'],
            'emoji'     : '',
            'shortcode' : '',
            'codepoints': []
        }
        title_elements = results[i]['title'].split(':')
        base_title     = title_elements[0]
        rest_of_title  = 'default' if (len(title_elements) == 1) else title_elements[1]
        if (base_title not in emojis_by_title):
            emojis_by_title[base_title] = {}


        # scrape the webpage
        print(f'{i}/{len(results)}')
        r = requests.get(f'https://emojipedia.org{results[i]["href"]}')
        time.sleep(0.2)

        # find the emoji
        regex_result = re.search(EMOJI_PATTERN, r.text)
        if (regex_result):
            emoji_obj['emoji'] = regex_result.groups()[0]

        # find the emoji shortcode
        regex_result = re.search(SHORTCODES_PATTERN, r.text)
        if (regex_result):
            emoji_obj['shortcode'] = regex_result.groups()[0]

        # extract the unicode codepoints
        regex_result = re.search(UNICODE_PATTERN, r.text)
        if (regex_result):
            emoji_obj['codepoints'] = list( regex_result.groups() )


        # add this emoji in its proper spot
        emojis_by_title[base_title][rest_of_title] = emoji_obj


    with open('emojis.json', 'w') as fp:
        json.dump(emojis_by_title, fp)
    print(f'Done scraping and writing {len(results)} emojis ({len(emojis_by_title)} unique) to ./emojis.json')



# Run --------------------------------------------------------------------------

if (__name__ == '__main__'):
    main()
