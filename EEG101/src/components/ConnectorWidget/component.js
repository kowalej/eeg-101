// ConnectorWidget.js
// An interface component with a picker and two buttons that handles connection to Muse devices

import React, { Component } from 'react';
import {
  Text,
  View,
  DeviceEventEmitter,
  StyleSheet,
  PermissionsAndroid
} from 'react-native';
import config from '../../redux/config'
import Connector from '../../interface/Connector';
import WhiteButton from '../WhiteButton'

export default class ConnectorWidget extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listeners: [],
    };
  }

  // Checks if user has enabled coarse location permission neceessary for BLE function
  // If not, displays request popup, otherwise proceeds to startConnector()
  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          'title': 'EEG 101 needs your permission',
          'message': 'This app requires coarse location permission in order to discover and connect to the 2016 Muse'
        }
      );
      if (granted) {
        console.log("Coarse Location granted")
      } else {
        console.log("Coarse Location denied")
      }
      // Whether permission is granted or not, connection proceeds in case user is using first gen device
      this.startConnector();
    } catch (err) {
      console.warn(err)
    }
  }

  // Calls getAndConnectoToDevice in native ConnectorModule after creating promise listeners
  startConnector() {
    // This listner will update connection status if no Muses are found in getMuses call
    const noMuseListener = DeviceEventEmitter.addListener('NO_MUSES', (event) => {
      this.props.setConnectionStatus(config.connectionStatus.NO_MUSES);
    });

    // This listener will detect when the connector module enters the temporary 'connecting...' state
    const connectionListener = DeviceEventEmitter.addListener('CONNECT_ATTEMPT', (event) => {
      this.props.setConnectionStatus(config.connectionStatus.CONNECTING);
    });

    this.setState({listeners: [noMuseListener, connectionListener]});
    this.props.getAndConnectToDevice();
  }

  // request location permissions and call getAndConnectToDevice and register event listeners when component loads
  componentDidMount() {
    this.requestLocationPermission();
  }

  componentWillUnmount() {
    this.state.listeners.forEach((listener) => listener.remove());
    Connector.stopConnector();
  }

	render() {
    // switch could also further functionality to handle multiple connection conditions
    switch(this.props.connectionStatus) {
      case config.connectionStatus.CONNECTED:
        connectionString = 'Connected';
        dynamicTextStyle = styles.connected;
        break;
      case config.connectionStatus.NO_MUSES:
        dynamicTextStyle = styles.noMuses;
        return(
          <View style={styles.container}>
            <Text style={dynamicTextStyle}>No Muses were detected.</Text>
            <Text style={styles.body}>If you don't own a Muse, don't worry! We are working on an offline mode that should be avaible in early 2017!</Text>
            <WhiteButton onPress={()=>this.props.getAndConnectToDevice()}>SEARCH AGAIN</WhiteButton>
          </View>
        );
      case config.connectionStatus.CONNECTING:
        connectionString = 'Connecting...'
        dynamicTextStyle = styles.connecting;
        break;
      case config.connectionStatus.DISCONNECTED:
        connectionString = 'Searching for Muses...'
        dynamicTextStyle = styles.disconnected;
    }

		return(
				<View style={styles.textContainer}>
					<Text style={dynamicTextStyle}>{connectionString}</Text>
				</View>
		)
	}
};

const styles = StyleSheet.create({

 	container: {
 		flex: 2.5,
 		flexDirection: 'column',
 		justifyContent: 'space-around',
    alignItems: 'stretch',
    marginLeft: 50,
    marginRight: 50,
 	},
  active: {
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    height: 50,
    margin: 5,
    padding: 5,
    alignItems: 'center',
  },

  buttonContainer: {
    flex: 1,
    margin: 40,
    justifyContent: 'center',
  },

  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    margin: 40,
    padding: 5,
    backgroundColor: '#ffffff',
  },

  body: {
    fontFamily: 'Roboto-Light',
    fontSize: 15,
    marginBottom: 5,
    color: '#ffffff',
    textAlign: 'center'
  },

 	connected: {
 		fontFamily: 'Roboto-Light',
 		fontSize: 20,
 		color: '#0ef357',
 	},

 	disconnected: {
 		fontFamily: 'Roboto-Light',
 		fontSize: 20,
 		color: '#f3410e',
    textAlign: 'center',
 	},

  noMuses: {
    fontFamily: 'Roboto-Light',
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
  },

  connecting: {
    fontFamily: 'Roboto-Light',
    fontSize: 20,
    color: '#42f4d9',
  }


});






