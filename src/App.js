/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */


import React, { Component } from 'react';
import FCM, { FCMEvent,
              NotificationType,
              WillPresentNotificationResult,
              RemoteNotificationResult } from 'react-native-fcm';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AppState,
  Alert
} from 'react-native';
import Push from 'appcenter-push';
import Content from './res/content.js';
import textvar from './js/text.js';
import QuizText from './services/api.js';
import DemoIP from './services/demo.js';
import Buttons from './services/buttons.js';
import ContainerLogin from './partials/container-login.js';
import LoginBtn from './services/login.js';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

Push.setListener({
  onPushNotificationReceived: function (pushNotification) {
    console.log('an message was sent')
    let message = pushNotification.message;
    let title = pushNotification.title;

    if (message === null || message === undefined) {
      // Android messages received in the background don't include a message. On Android, that fact can be used to
      // check if the message was received in the background or foreground. For iOS the message is always present.
      title = 'Android background';
      message = '<empty>';
    }

    // Custom name/value pairs set in the App Center web portal are in customProperties
    if (pushNotification.customProperties && Object.keys(pushNotification.customProperties).length > 0) {
      message += '\nCustom properties:\n' + JSON.stringify(pushNotification.customProperties);
    }

    if (AppState.currentState === 'active') {
      Alert.alert(title, message);
    }
    else {
      console.log('app state was', AppState)
      // Sometimes the push callback is received shortly before the app is fully active in the foreground.
      // In this case you'll want to save off the notification info and wait until the app is fully shown
      // in the foreground before displaying any UI. You could use AppState.addEventListener to be notified
      // when the app is fully in the foreground.
    }
  }
});
const pushEnabled = Push.isEnabled();
console.log('push is ', pushEnabled)
Push.setEnabled(true);
const pushEnabled2 = Push.isEnabled();
console.log('push is now ', pushEnabled2)
// this shall be called regardless of app state: running, background or not running. Won't be called when app is killed by user in iOS
FCM.on(FCMEvent.Notification, async (notif) => {
  console.log('FCM notification!', notif)
    // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
    if(notif.local_notification){
      //this is a local notification
    }
    if(notif.opened_from_tray){
      //iOS: app is open/resumed because user clicked banner
      //Android: app is open/resumed because user clicked banner or tapped app icon
    }
    // await someAsyncCall();

    if(Platform.OS ==='ios'){
      if (notif._actionIdentifier === 'com.myapp.MyCategory.Confirm') {
        // handle notification action here
        // the text from user is in notif._userText if type of the action is NotificationActionType.TextInput
      }
      //optional
      //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623013-application.
      //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
      //notif._notificationType is available for iOS platfrom
      switch(notif._notificationType){
        case NotificationType.Remote:
          notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
          break;
        case NotificationType.NotificationResponse:
          notif.finish();
          break;
        case NotificationType.WillPresent:
          notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
          break;
      }
    }
});
//const testApi = shwApi.foo();
// To see all the requests in the chrome Dev tools in the network tab.
XMLHttpRequest = GLOBAL.originalXMLHttpRequest ?
    GLOBAL.originalXMLHttpRequest :
    GLOBAL.XMLHttpRequest;

  // fetch logger
global._fetch = fetch;
global.fetch = function (uri, options, ...args) {
  return global._fetch(uri, options, ...args).then((response) => {
    console.log('Fetch - ');
    console.log('request', { uri, options, ...args })
    console.log('response', response)
    return response;
  });
};

export default class App extends Component<{}> {
  render() {
    return (
      <View style={styles.container}>
        <LoginBtn/>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
        <Text style={styles.instructions}>
          {instructions}
        </Text>
        <Text>
          hello world, from in src
        </Text>
        <Content></Content>
        <Text>
          {textvar}
        </Text>
        <Text>
          push i
        </Text>
        <DemoIP></DemoIP>
        <QuizText></QuizText>
        <ContainerLogin>
          <Buttons></Buttons>
        </ContainerLogin>
      </View>
    );
  }

  componentDidMount() {
    // iOS: show permission prompt for the first call. later just check permission in user settings
    // Android: check permission in user settings
    FCM.requestPermissions().then(()=>console.log('granted')).catch(()=>console.log('notification permission rejected'));

    FCM.getFCMToken().then(token => {
        console.log(token)
        // store fcm token in your server
    });

    this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {
        // optional, do some component related stuff
    });

    // initial notification contains the notification that launchs the app. If user launchs app by clicking banner, the banner notification info will be here rather than through FCM.on event
    // sometimes Android kills activity when app goes to background, and when resume it broadcasts notification before JS is run. You can use FCM.getInitialNotification() to capture those missed events.
    // initial notification will be triggered all the time even when open app by icon so send some action identifier when you send notification
    FCM.getInitialNotification().then(notif => {
       console.log(notif)
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
