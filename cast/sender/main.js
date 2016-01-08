// main.js
// for Quizlet Chromecast sender page
//
// Eric Schmidt Jan 2016

(function(win, doc) {

  // Game variables
  var gameState;

  // Initializes stuff
  function init() {
    bindEventListeners();
    sender.listen(handleMessage);
  }

  // Binds all event listeners for the page
  function bindEventListeners() {
    $('#btn-join').click(function() {
      sender.join();
    });

    $('#btn-leave').click(function() {
      sender.leave();
    });

    $('#btn-submit-username').click(function() {
      var username = $('#inp-username').val();
      sender.setUsername(username);
    });

    $('#btn-submit-set-id').click(function() {
      var setId = parseInt($('#inp-set-id').val(), 10);
      sender.loadSet(setId);
    });

    $('#btn-start-game').click(function() {
      sender.startGame('DUMB');
    });
  }

  // Message handler
  function handleMessage(message) {
    if (message.type === 'GAME_STATE') {
      gameState = message.data.state;
    }
  };

  // Call init on page load
  $(doc).ready(init);

})(window, document);
