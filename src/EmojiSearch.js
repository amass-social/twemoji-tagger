import React from 'react';
import './EmojiSearch.css';

const emojiList = require('./emojis.json');


class EmojiSearch extends React.Component {
  render() {
    return (
      <div>
        <p>EmojiSearch</p>
        <p>{emojiList['emojis'].length}</p>
      </div>
    );
  }
}

export default EmojiSearch;
