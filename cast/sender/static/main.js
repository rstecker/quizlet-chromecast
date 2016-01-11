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
    showScreen('join');
  }

  // Screens
  function showScreen(name) {
    $('.screen').hide();
    $('#screen-'+name).show();
  }

  // Event listeners
  function onSubmitJoin() {
    var username = $('#inp-username').val();
    sender.join(function() {
      sender.setUsername(username);
      showScreen('start');
    });
  }

  function onSubmitSetId() {
    var setId = parseInt($('#inp-set-id').val(), 10);
    sender.loadSet(setId);
  }

  function bindEventListeners() {
    $('#btn-join').click(onSubmitJoin);
    $('#inp-username').keypress(function(e) {
      if (e.which === 13) onSubmitJoin();
    });

    $('#btn-leave').click(function() {
      sender.leave();
    });

    $('#btn-submit-set-id').click(onSubmitSetId);
    $('#inp-set-id').keypress(function(e) {
      if (e.which === 13) onSubmitSetId();
    });

    $('#btn-start-game').click(function() {
      sender.startGame('QUIZUP');
    });
  }

  // Message handler
  function handleMessage(message) {
    if (message.type === 'GAME_STATE') {
      gameState = message.data.state;
      if (gameState.state === 'PLAYING') showScreen('playing');
      console.log(gameState);
    } else if (message.type === 'OBJECTIVE') {
      displayQuestion(message.data.correctId, message.data.possibleIds, !message.data.showDefinition);
    }
  }

  // UI stuff
  function displayQuestion(correctId, possibleIds, showDefinition) {
    var correctTerm = gameState.set.terms.find(function(term) { return term.id === correctId; });
    var questionPrompt = !showDefinition ? correctTerm.definition : correctTerm.term;
    var choices = possibleIds.map(function(id) {
      return gameState.set.terms.find(function(term) { return term.id === id; });
    });
    $('#disp-question-choices').empty();
    choices.map(function(term) {
      var choiceText = showDefinition ? term.definition : term.term;
      var el = $('<button>').addClass('answer-choice').text(choiceText);
      el.click(function() {
        sender.submitAnswer(correctId, term.id);
      });
      $('#disp-question-choices').append(el);
    });
    $('#disp-question-prompt').text(questionPrompt);
  }

  // Call init on page load
  $(doc).ready(init);

})(window, document);
