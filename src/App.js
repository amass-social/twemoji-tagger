import React from 'react';
import './App.css';

import emoji from 'react-easy-emoji';

import EmojiSearch          from './EmojiSearch.js';
import CategorizeEmojisTool from './CategorizeEmojisTool.js';


class App extends React.Component {
  render() {
    return (
      <div className="App">
        {/* <p>{ emoji('Emojis make me 😀 😀 🤞🏿') }</p> */}
        <div id="categorize-emojis-container">
          <CategorizeEmojisTool/>
        </div>
      </div>
    );
  }
}

export default App;
