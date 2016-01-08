// Quizlet Chromecast sender
// Jan 2016

(function(win) {

  // Constants
  var APP_ID = '243116E9';
  var CHANNEL = 'urn:x-cast:duck';

  // The Chromecast session
  var session;

  // Logger
  function log(msg) {
    console.log('[Chromecast] '+msg);
  }

  // Listeners
  function receiverListener(e) {
    if (e === chrome.cast.ReceiverAvailability.AVAILABLE) {
      log('Receiver available');
    }
  }

  function onSession(e) {
    log('Session connected');
    session = e;
    e.addMessageListener(CHANNEL, handleMessage);
    if (session.status !== chrome.cast.SessionStatus.CONNECTED) {
      log('Session disconnected');
    }
  }

  function onInitSuccess() {
    log('Initialized');
  }

  function onStopSuccess() {
    log('Session stopped');
  }

  function onSendMessageSuccess() {
    log('Message sent');
  }

  function onError(e) {
    log('Error: '+e.code+', '+e.description);
  }

  win['__onGCastApiAvailable'] = function(loaded, errorInfo) {
    if (loaded) {
      initCastApi();
    } else {
      log(errorInfo);
    }
  };

  // Message handler
  function handleMessage(channel, msg) {
    log(msg);
  }

  // Initializes the Chromecast API
  function initCastApi() {
    var sessionRequest = new chrome.cast.SessionRequest(APP_ID);
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest, onSession, receiverListener);
    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
  }

  // SENDER ACTIONS
  var launch = win.launch = function() {
    chrome.cast.requestSession(onSession, onError);
  };

  var stopApp = win.stopApp = function() {
    session.stop(onStopSuccess, onError);
  };

  var sendMessage = win.sendMessage = function(msg) {
    session.sendMessage(CHANNEL, msg, onSendMessageSuccess, onError);
  };

})(window);
