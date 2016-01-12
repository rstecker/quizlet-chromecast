// main.js
// for Quizlet Chromecast sender page
//
// Eric Schmidt Jan 2016

(function(win, doc) {

  // Game variables
  var gameType = 'DUMB';
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

  function onStartGame() {
    sender.startGame(gameType);
  }

  function onExit() {
    showScreen('start');
  }

  function bindEventListeners() {
    $('#btn-join').click(onSubmitJoin);
    $('#inp-username').keypress(function(e) {
      if (e.which === 13) onSubmitJoin();
    });

    $('#btn-submit-set-id').click(onSubmitSetId);
    $('#inp-set-id').keypress(function(e) {
      if (e.which === 13) onSubmitSetId();
    });

    $('.btn-dumb').click(function() {
      gameType = 'DUMB';
      onStartGame();
    });

    $('.btn-quizup').click(function() {
      gameType = 'QUIZUP';
      onStartGame();
    });

    $('.btn-restart').click(onStartGame);

    $('.btn-exit').click(onExit);
  }

  // Message handler
  function handleMessage(message) {
    if (message.type === 'GAME_STATE') {
      console.log(message.data.state);
      gameState = message.data.state;
      if (gameState.state === 'PLAYING') {
        showScreen('playing');
        updateScore(message.data.playerId);
      } else if (gameState.state === 'ENDED') {
        showScreen('ended');
      } else {
        showScreen('start');
      }
      if (gameState.state === 'LOADED') {
        showSetLoaded(gameState.set.id);
      }
    } else if (message.type === 'OBJECTIVE') {
      displayQuestion(message.data.correctId, message.data.possibleIds, !message.data.showDefinition);
    }
  }

  // UI stuff
  function showScreen(name) {
    $('.screen').hide();
    $('#screen-'+name).show();
  }

  function showSetLoaded(setId) {
    $('#disp-set-id').text(setId);
    $('#msg-set-loaded').show();
  }

  function updateScore(id) {
    var score = gameState.players[id].score;
    $('.disp-score').text(score);
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
        if (canAnswer) {
          if (term.id === correctId) {
            el.addClass('correct');
          } else {
            el.addClass('incorrect');
          }
          sender.submitAnswer(correctId, term.id);
        }
        if (gameType === 'QUIZUP') canAnswer = false;
      });
      $('#disp-question-choices').append(el);
    });
    canAnswer = true;
  }

  // Call init on page load
  $(doc).ready(init);

})(window, document);
