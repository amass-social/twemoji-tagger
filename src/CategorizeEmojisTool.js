import React from 'react';
import './CategorizeEmojisTool.css';
import emoji from 'react-easy-emoji';


let emojisList = require('./emojis.json');

class CategorizeEmojisTool extends React.Component {

  constructor() {
    super();
    this.state = {
      groups        : {'group_1': {}},
      groupOrder    : ['group_1'],
      selectedGroup : 'group_1',
      usedEmojiIds  : {}
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
    newGroupsState[newGroupId] = {};


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


  // Render --------------------------------------------------------------------

  renderAllEmojis = () => {
    let emojisToRender = [];
    for (let i = 0; i < emojisList['emojis'].length; i++) {
      let emojiObj = emojisList['emojis'][i];
      emojisToRender.push(<p className="emoji">{emoji(`${emojiObj['emoji']}`)}</p>);
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
            <button>Copy JSON to Clipboard</button>
          </div>
          {this.renderGroups()}
        </div>
        <div id="emojis-container"></div>
        {/* this.renderAllEmojis() */}
      </div>
    );
  }
}

export default CategorizeEmojisTool;
