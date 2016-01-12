// main.js
// for Quizlet Chromecast sender page
//
// Eric Schmidt Jan 2016

(function(win, doc) {

  // Game variables
  var gameState;

  // Helpers
  function error(message) {
    console.log(message);
  }

  function shuffle(o) {
      for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
  }

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
    if (!username) {
      return error('Please enter a username!');
    }
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
      sender.startGame('DUMB');
    });
  }

  // Message handler
  function handleMessage(message) {
    if (message.type === 'GAME_STATE') {
      console.log(message);
      gameState = message.data.state;
      if (gameState.state === 'PLAYING') {
        showScreen('playing');
        updateScore(message.data.playerId);
      }
    } else if (message.type === 'OBJECTIVE') {
      displayQuestion(message.data.correctId, message.data.possibleIds, !message.data.showDefinition);
    }
  }

  // UI stuff
  function updateScore(id) {
    var score = gameState.players[id].score;
    $('#disp-score').text(score);
    var place = Object.keys(gameState.players).reduce(function(count, playerId) {
      if (gameState.players[playerId].score > score) return count+1;
      else return count;
    }, 1);
    $('#disp-place').text(place);
    var suffix = 'th';
    if (place % 10 === 1) suffix = 'st';
    else if (place % 10 === 2) suffix = 'nd';
    else if (place % 10 === 3) suffix = 'rd';
    $('#disp-place-suffix').text(suffix);
  }

  function displayQuestion(correctId, possibleIds, showDefinition) {
    var correctTerm = gameState.set.terms.find(function(term) { return term.id === correctId; });
    var questionPrompt = !showDefinition ? correctTerm.definition : correctTerm.term;
    $('#disp-question-prompt').empty().text(questionPrompt);
    if (correctTerm.image) {
      var img = $('<img>').attr('src', correctTerm.image);
      $('#disp-question-prompt').append(img);
    }
    var choices = shuffle(possibleIds).map(function(id) {
      return gameState.set.terms.find(function(term) { return term.id === id; });
    });
    $('#disp-question-choices').empty();
    choices.map(function(term) {
      var choiceText = showDefinition ? term.definition : term.term;
      var el = $('<button>').addClass('answer-choice').text(choiceText);
      if (term.image) {
        var img = $('<img>').attr('src', term.image);
        el.append(img);
      }
      el.click(function() {
        sender.submitAnswer(correctId, term.id);
      });
      $('#disp-question-choices').append(el);
    });
  }

  // Call init on page load
  $(doc).ready(init);

})(window, document);
