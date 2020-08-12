import React from 'react';
import './CategorizeEmojisTool.css';
import emoji from 'react-easy-emoji';


const EMOJIS = require('./emojis/emoji_definitions.json');

class CategorizeEmojisTool extends React.Component {

  constructor() {
    super();
    this.state = {
      groups        : {'group_1': [/* emojiIds */]},
      groupOrder    : ['group_1'],
      selectedGroup : 'group_1',
      usedEmojiIds  : {/* EmojiID -> index of group in state.groupOrder */}
    }
  }

  // Common Functions ----------------------------------------------------------

  getIndexOfSelectedGroup = () => {
    for (let i = 0; i < this.state.groupOrder.length; i++) {
      if (this.state.groupOrder[i] === this.state.selectedGroup) {
        return i;
      }
    }
    return undefined;
  }

  // Input ---------------------------------------------------------------------

  onInput_changeGroupName = (e, oldName) => {

    // make sure the user can't accidentally merge two groups into the same ID
    let newName = e.target.value;
    if (newName in this.state.groups) {
      return;
    }

    // update the groupID in state.groups
    let newGroupsState = {};
    for (let groupId in this.state.groups) {
      if (groupId !== oldName) {
        newGroupsState[groupId] = this.state.groups[groupId];
      }
    }
    newGroupsState[newName] = this.state.groups[oldName];

    // update the groupID in state.groupOrder
    let newGroupOrder = [];
    for (let i = 0; i < this.state.groupOrder.length; i++) {
      let name = this.state.groupOrder[i];
      if (name !== oldName) {
        newGroupOrder.push(name);
      } else {
        newGroupOrder.push(newName);
      }
    }

    // save new state
    this.setState({groups: newGroupsState, selectedGroup: newName, groupOrder: newGroupOrder});
  }


  onClick_createNewGroup = () => {

    // create the group object for state.group
    let newGroupsState = {};
    let newGroupId = `group_${Object.keys(this.state.groups).length + 1}`;
    for (let groupId in this.state.groups) {
      newGroupsState[groupId] = this.state.groups[groupId];
    }
    newGroupsState[newGroupId] = [];


    // add the group to state.groupOrder
    let newGroupOrder = [];
    for (let i = 0; i < this.state.groupOrder.length; i++) {
      newGroupOrder.push(this.state.groupOrder[i]);
    }
    newGroupOrder.push(newGroupId);

    // update state
    this.setState({groups: newGroupsState, selectedGroup: newGroupId, groupOrder: newGroupOrder});
  }


  onClick_selectGroup = (groupId) => {
    this.setState({selectedGroup: groupId});
  }


  // this function can handle the following cases:
  //  1) If the emoji is not selected at all -> select it and add it to the currently selected group
  //  2) If the emoji is selected in the currently selected group -> deselect it entirely
  // Therefore, if an emoji is selected in a different group, you have to switch to that group and deselect it before selecting it from another group
  onClick_selectEmoji = (emojiId) => {

    // get the index of the currently selected groupID
    let indexOfSelectedGroup = this.getIndexOfSelectedGroup();


    // case 1) select this unselected emoji
    if (! (emojiId in this.state.usedEmojiIds)) {

      // assign in state.usedEmojiIds
      let newUsedEmojiIds = Object.assign({}, this.state.usedEmojiIds);
      newUsedEmojiIds[emojiId] = indexOfSelectedGroup;

      // add to state.groups
      let newGroupEmojis = Object.assign([], this.state.groups[this.state.selectedGroup]);
      newGroupEmojis.push(emojiId);
      let newGroups = Object.assign({}, this.state.groups);
      newGroups[this.state.selectedGroup] = newGroupEmojis;

      this.setState({groups: newGroups, usedEmojiIds: newUsedEmojiIds});
      return;
    }

    // case 2) the emoji is already selected in this group -> unselect it
    if (this.state.usedEmojiIds[emojiId] === indexOfSelectedGroup) {

      // remove the emoji ID from usedEmojiIds
      let newUsedEmojiIds = {};
      for (let key in this.state.usedEmojiIds) {
        if (key !== emojiId) {
          newUsedEmojiIds[key] = this.state.usedEmojiIds[key];
        }
      }

      // remove the emoji from the currently selected state.group
      let newGroupEmojis = [];
      for (let i = 0; i < this.state.groups[this.state.selectedGroup].length; i++) {
        let name = this.state.groups[this.state.selectedGroup][i];
        if (name !== emojiId) {
          newGroupEmojis.push(name);
        }
      }
      let newGroups = Object.assign({}, this.state.groups);
      newGroups[this.state.selectedGroup] = newGroupEmojis;

      this.setState({groups: newGroups, usedEmojiIds: newUsedEmojiIds});
      return;
    }
  }


  onClick_copyGroupsToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(this.state.groups));
    alert('saved');
  }


  // this function will load an existing session from emojis/emoji/categories.json
  onClick_loadEmojiCategories = () => {
    let loaded = require('./emojis/emoji_categories.json');
    let groups = {};
    let groupOrder = [];
    let selectedGroup = '';
    let usedEmojiIds = {};

    let sortedGroupNames = Object.keys(loaded).sort();
    selectedGroup = sortedGroupNames[0];
    for (let i = 0; i < sortedGroupNames.length; i++) {
      let groupId = sortedGroupNames[i];
      groupOrder.push(groupId)
      groups[groupId] = loaded[groupId];
      for (let j = 0; j < loaded[groupId].length; j++) {
        let emojiId = loaded[groupId][j];
        usedEmojiIds[emojiId] = i;
      }
    }

    this.setState({
      groups        : groups,
      groupOrder    : groupOrder,
      selectedGroup : selectedGroup,
      usedEmojiIds  : usedEmojiIds
    });
  }


  // Render --------------------------------------------------------------------

  renderAllEmojis = () => {
    let emojisToRender = [];
    let indexOfSelectedGroup = this.getIndexOfSelectedGroup();
    for (let emojiId in EMOJIS) {
      let emojiObj = EMOJIS[emojiId]['default'];
      if (emojiObj !== undefined && 'emoji' in emojiObj) {
        let emojiText = emoji(`${emojiObj['emoji']}`);
        // let emojiText = '.'; <- for placeholder during development
        let containerCSS = 'emoji-box';
        if (emojiId in this.state.usedEmojiIds ) {
          if (this.state.usedEmojiIds[emojiId] === indexOfSelectedGroup) {
            containerCSS = 'emoji-box selected';
          } else {
            containerCSS = 'emoji-box selected-in-different-group';
          }
        }
        emojisToRender.push(
          <div className={containerCSS} onClick={() => this.onClick_selectEmoji(emojiId)}>
            <p className="emoji">{emojiText}</p>
          </div>
        );
      }
    }
    return emojisToRender;
  }

  renderGroups = () => {
    let groupsToRender = [];
    for (let i = 0; i < this.state.groupOrder.length; i++) {
      let groupId = this.state.groupOrder[i];
      let group = this.state.groups[groupId];
      let groupCSS = (this.state.selectedGroup === groupId) ? "group selected" : "group";
      groupsToRender.push(
        <div className={groupCSS} onClick={() => this.onClick_selectGroup(groupId)}>
          <input value={groupId} onChange={(e) => this.onInput_changeGroupName(e, groupId)}/>
          <p>{Object.keys(group).length}</p>
        </div>
      );
    }
    return (
      <div id="groups-container">
        {groupsToRender}
      </div>
    );
  }


  render() {
    return(
      <div id="CategorizeEmojisTool">
        <div id="control-panel">
          <h1>Groups</h1>
          <div id="buttons-group">
            <button onClick={this.onClick_createNewGroup}>New Group</button>
            <button onClick={this.onClick_copyGroupsToClipboard}>Copy JSON to Clipboard</button>
            <button onClick={this.onClick_loadEmojiCategories}>Load from JSON</button>
          </div>
          {this.renderGroups()}
        </div>
        <div id="emojis-container">
          {this.renderAllEmojis()}
        </div>
      </div>
    );
  }
}

export default CategorizeEmojisTool;
