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
      console.log(gameState);
    } else if (message.type === 'OBJECTIVE') {
      displayQuestion(message.data.correctId, message.data.possibleIds, !message.data.showDefinition);
    }
  }

  // UI stuff
  function displayQuestion(correctId, possibleIds, showDefinition) {
    console.log(showDefinition);
    var correctTerm = gameState.set.terms.find(function(term) { return term.id === correctId; });
    var questionPrompt = !showDefinition ? correctTerm.definition : correctTerm.term;
    var choices = possibleIds.map(function(id) {
      return gameState.set.terms.find(function(term) { return term.id === id; });
    });
    $('#disp-question-choices').empty();
    choices.map(function(term) {
      var choiceText = showDefinition ? term.definition : term.term;
      var li = $('<li>').text(choiceText);
      li.click(function() {
        sender.submitAnswer(correctId, term.id);
      });
      $('#disp-question-choices').append(li);
    });
    $('#disp-question-prompt').text(questionPrompt);
  }

  // Call init on page load
  $(doc).ready(init);

})(window, document);
