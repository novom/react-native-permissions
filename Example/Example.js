/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Text,
  View,
  Alert,
  AppState,
  Platform,
} from 'react-native';

import Permissions from 'react-native-permissions'

export default class Example extends Component {
  state = {
    types: [],
    status: {},
  }

  componentDidMount() {
    let types = Permissions.getPermissionTypes()
    this.setState({ types })
    this._updatePermissions(types)
    AppState.addEventListener('change', this._handleAppStateChange.bind(this));
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange.bind(this));
  }

  //update permissions when app comes back from settings
  _handleAppStateChange(appState) {
    if (appState == 'active') {
      this._updatePermissions(this.state.types)
    }
  }

  _openSettings() {
    return Permissions.openSettings()
      .then(() => alert('back to app!!'))
  }

  _updatePermissions(types) {
    Permissions.checkMultiplePermissions(types)
      .then(status => {
        if (this.state.isAlways) {
          return Permissions.getPermissionStatus('location', 'always')
            .then(location => ({...status, location}))
        }
        return status
      })
      .then(status => this.setState({ status }))
  }

  _requestPermission(permission) {
    var options

    if (permission == 'location') {
      options = this.state.isAlways ? 'always' : 'whenInUse'
    }

    Permissions.requestPermission(permission, options)
      .then(res => {
        this.setState({
          status: {...this.state.status, [permission]: res}
        })
        if (res != 'authorized') {
          Alert.alert(
            'Whoops!',
            "There was a problem getting your permission. Please enable it from settings.",
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Open Settings', onPress: this._openSettings.bind(this) },
            ]
          )
        }
      }).catch(e => console.warn(e))
  }

  _onLocationSwitchChange() {
    this.setState({ isAlways: !this.state.isAlways })
    this._updatePermissions(this.state.types)
  }

  render() {
    return (
      <View style={styles.container}>

        {this.state.types.map(p => (
          <TouchableHighlight 
            style={[styles.button, styles[this.state.status[p]]]}
            key={p}
            onPress={this._requestPermission.bind(this, p)}>
            <View>
              <Text style={styles.text}>
                {Platform.OS == 'ios' && p == 'location' ? `location ${this.state.isAlways ? 'always' : 'whenInUse'}` : p}
              </Text>
              <Text style={styles.subtext}>
                {this.state.status[p]}
              </Text>
            </View>
          </TouchableHighlight>
          )
        )}
        <View style={styles.footer}>
          <TouchableHighlight 
            style={styles['footer_'+Platform.OS]}
            onPress={this._onLocationSwitchChange.bind(this)}>
            <Text style={styles.text}>Toggle location type</Text>
          </TouchableHighlight>

          <TouchableHighlight 
            onPress={this._openSettings.bind(this)}>
            <Text style={styles.text}>Open settings</Text>
          </TouchableHighlight>
        </View>


        <Text style={styles['footer_'+Platform.OS]}>
          Note: microphone permissions may not work on iOS simulator. Also, toggling permissions from the settings menu may cause the app to crash. This is normal on iOS. Google "ios crash permission change"
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
    padding: 10,
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtext: {
    textAlign: 'center',
  },
  button: {
    margin: 5,
    borderColor: 'black',
    borderWidth: 3,
    overflow: 'hidden',
  },
  buttonInner: {
    flexDirection: 'column',
  },
  undetermined: {
    backgroundColor: '#E0E0E0',
  },
  authorized: {
    backgroundColor: '#C5E1A5',
  },
  denied: {
    backgroundColor: '#ef9a9a',
  },
  restricted: {
    backgroundColor: '#FFAB91'
  },
  footer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer_android: {
    height: 0,
    width: 0,
  }
})