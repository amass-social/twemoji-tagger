import React from 'react';
import './CategorizeEmojisTool.css';
import emoji from 'react-easy-emoji';

// Imports ---------------------------------------------------------------------

import Files from 'react-files';

// Constants -------------------------------------------------------------------

const EMOJIS  = require('./emojis/emoji_definitions.json');
const DEVMODE = false;


// <CategorizeEmojisTool/> -----------------------------------------------------

class CategorizeEmojisTool extends React.Component {

  constructor() {
    super();

    this.fileReader = new FileReader();
    this.fileReader.onload = (event) => {
      this.onClick_loadEmojiCategories(JSON.parse(event.target.result));
    }


    this.state = {
      groups                    : {'group_1': [/* emojiIds */]},
      groupOrder                : ['group_1'],
      selectedGroup             : 'group_1',
      usedEmojiIds              : {/* EmojiID -> index of group in state.groupOrder */},
      highlightUnselectedActive : false,
      groupIcons                : {'group_1': ''},
      selectGroupIconActive     : false
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


  getEmojiByTitle = (emojiId) => {
    if (emojiId === '') { return; }
    if (emojiId in EMOJIS) {
      if ('emoji' in EMOJIS[emojiId]['default']) {
        return emoji(EMOJIS[emojiId]['default']['emoji']);
      }
    }
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

    // update the groupID in state.groupIcons
    let newGroupIcons = {};
    for (let groupId in this.state.groupIcons) {
      if (groupId !== oldName) {
        newGroupIcons[groupId] = this.state.groupIcons[groupId];
      }
    }
    newGroupIcons[newName] = this.state.groupIcons[oldName];

    // save new state
    this.setState({
      groups: newGroupsState,
      selectedGroup: newName,
      groupOrder: newGroupOrder,
      groupIcons: newGroupIcons
    });
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

    // add the group to state.groupIcons
    let newGroupIcons = Object.assign({}, this.state.groupIcons);
    newGroupIcons[newGroupId] = '';

    // update state
    this.setState({
      groups: newGroupsState,
      selectedGroup: newGroupId,
      groupOrder: newGroupOrder,
      groupIcons: newGroupIcons
    });
  }


  onClick_selectGroup = (groupId) => {
    this.setState({selectedGroup: groupId});
  }



  onClick_selectEmoji = (emojiId) => {
    if (this.state.selectGroupIconActive) {
      this.onClick_selectEmojiForGroupIcon(emojiId);
    } else {
      this.onClick_selectEmojiIntoGroup(emojiId);
    }
  }


  // this function can handle the following cases:
  //  1) If the emoji is not selected at all -> select it and add it to the currently selected group
  //  2) If the emoji is selected in the currently selected group -> deselect it entirely
  //  3) if the emoji is selected in a different group -> switch to that group
  // Therefore, if an emoji is selected in a different group, you have to switch to that group and deselect it before selecting it from another group
  onClick_selectEmojiIntoGroup = (emojiId) => {
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

    // case 3) the emoji is selected in a different group -> change state.selectedGroup to point at that group
    let groupIndex = this.state.usedEmojiIds[emojiId];
    this.onClick_selectGroup(this.state.groupOrder[groupIndex]);
  }


  // this function can handle the following cases:
  //  1) the icon is currently not a group icon -> set it as the current group's icon
  //  2) the icon is the current groups icon -> deselect it
  onClick_selectEmojiForGroupIcon = (emojiId) => {

    // 1) select this emoji
    if (this.state.groupIcons[this.state.selectedGroup] === '') {
      let newGroupIcons = Object.assign({}, this.state.groupIcons);
      newGroupIcons[this.state.selectedGroup] = emojiId;
      this.setState({groupIcons: newGroupIcons});
      return;
    }

    // 2) deselect this emoji
    if (this.state.groupIcons[this.state.selectedGroup] === emojiId) {
      let newGroupIcons = Object.assign({}, this.state.groupIcons);
      newGroupIcons[this.state.selectedGroup] = '';
      this.setState({groupIcons: newGroupIcons});
      return;
    }
  }


  // this function will load an existing session from emojis/emoji/categories.json
  onClick_loadEmojiCategories = (loaded) => {
    let loadedGroups = loaded['groups'];
    let loadedIcons  = loaded['groupIcons'];

    let groups = {};
    let groupOrder = [];
    let selectedGroup = '';
    let usedEmojiIds = {};
    let groupIcons = Object.assign({}, loadedIcons);

    let sortedGroupNames = Object.keys(loadedGroups).sort();
    selectedGroup = sortedGroupNames[0];
    for (let i = 0; i < sortedGroupNames.length; i++) {
      let groupId = sortedGroupNames[i];
      groupOrder.push(groupId)
      groups[groupId] = loadedGroups[groupId];
      for (let j = 0; j < loadedGroups[groupId].length; j++) {
        let emojiId = loadedGroups[groupId][j];
        usedEmojiIds[emojiId] = i;
      }
    }

    this.setState({
      groups        : groups,
      groupOrder    : groupOrder,
      selectedGroup : selectedGroup,
      usedEmojiIds  : usedEmojiIds,
      groupIcons    : groupIcons
    });
  }


  onClick_activateSelectGroupIcon = () => {
    this.setState({selectGroupIconActive: !this.state.selectGroupIconActive});
  }

  // Render --------------------------------------------------------------------

  renderAllEmojis = () => {
    let missingEmojis = [];
    let emojisToRender = [];
    let indexOfSelectedGroup = this.getIndexOfSelectedGroup();
    for (let emojiId in EMOJIS) {
      let emojiObj = EMOJIS[emojiId]['default'];
      let numEmojiVersions = Object.keys(EMOJIS[emojiId]).length
      if (emojiObj !== undefined && 'emoji' in emojiObj) {
        let emojiText = emoji(`${emojiObj['emoji']}`);
        if (DEVMODE === true) {
          emojiText = '.'; // <- for placeholder during development
        }
        let containerCSS = 'emoji-box';
        if (emojiId in this.state.usedEmojiIds ) {
          if (this.state.usedEmojiIds[emojiId] === indexOfSelectedGroup) {
            containerCSS = 'emoji-box selected';
          } else {
            containerCSS = 'emoji-box selected-in-different-group';
          }
        } else {
          if (this.state.highlightUnselectedActive) {
            containerCSS = 'emoji-box unselected';
          }
        }

        emojisToRender.push(
          <div className={containerCSS} onClick={() => this.onClick_selectEmoji(emojiId)} title={emojiId}>
            <p className="emoji">{emojiText}</p>
            <p className="num-versions-label">{numEmojiVersions}</p>
          </div>
        );
      } else {
        missingEmojis.push(emojiId);
      }
    }
    //console.log(`missing: ${missingEmojis}`)
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
          <div className="group-icon">{this.getEmojiByTitle(this.state.groupIcons[groupId])}</div>
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

    // when the user clicks "save", this is the JSON object that gets downloaded
    let saveObject = {'groups': this.state.groups, 'groupIcons': this.state.groupIcons};
    let encodedSaveObject = `data:text/json;charset=utf-8,${JSON.stringify(saveObject)}`;

    return(
      <div id="CategorizeEmojisTool">
        <div id="control-panel">
          <div id="title-row">
            <h1>Groups</h1>
            <div id="save-buttons-container">
              <Files
                onChange={(file) => this.fileReader.readAsText(file[0])}
                onError={(err) => console.log(err)}
                accepts={[".json"]}
                clickable
                >
                <button className="save-button">load</button>
              </Files>
              <a href={encodedSaveObject} download="emoji-categories.json">
                <button className="save-button">save</button>
              </a>
            </div>
          </div>
          <div id="buttons-group">
            <button onClick={this.onClick_createNewGroup}>New Group</button>
            <button onClick={() => this.setState({highlightUnselectedActive: !this.state.highlightUnselectedActive})}>
              {(this.state.highlightUnselectedActive === false) ? "Highlight Unselected" : "Turn Highlight Off"}
            </button>
            <button onClick={this.onClick_activateSelectGroupIcon}>
              {(this.state.selectGroupIconActive === false) ? "Select Group Icons" : "Select Emojis"}
            </button>
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
