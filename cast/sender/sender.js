// Quizlet Chromecast sender library
// Jan 2016

(function(win) {

  // Namespace
  var sender = win.sender = {};

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
    log('Session ended');
  }

  function onLeaveSuccess() {
    log('Session disconnected');
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

  // Messaging
  var _handleMessage = function() {};

  function handleMessage(channel, msg) {
    var message = JSON.parse(msg);
    _handleMessage(message);
  }

  function sendMessage(msg) {
    session.sendMessage(CHANNEL, msg, onSendMessageSuccess, onError);
  }

  // Initializes the Chromecast API
  function initCastApi() {
    var sessionRequest = new chrome.cast.SessionRequest(APP_ID);
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest, onSession, receiverListener);
    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
  }

  // SENDER ACTIONS
  sender.join = function() {
    chrome.cast.requestSession(onSession, onError);
  };

  sender.stopSession = function() {
    session.stop(onStopSuccess, onError);
  };

  sender.leave = function() {
    session.leave(onLeaveSuccess, onError);
  };

  sender.setUsername = function(username) {
    sendMessage({
      type: 'SET_USERNAME',
      data: { username: username }
    });
  };

  sender.loadSet = function(id) {
    sendMessage({
      type: 'LOAD_SET',
      data: { id: id }
    });
  };

  sender.startGame = function(type) {
    sendMessage({
      type: 'START_GAME',
      data: { type: type }
    });
  };

  sender.submitAnswer = function(correctId, guessedId) {
    sendMessage({
      type: 'SUBMIT_ANSWER',
      data: {
        correctId: correctId,
        guessedId: guessedId
      }
    });
  };

  sender.listen = function(messageHandler) {
    _handleMessage = messageHandler;
  };

})(window);
