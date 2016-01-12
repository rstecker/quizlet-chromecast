game_QUIZUP = {
  currentAnswerSet: [],
  remainingQuestions: [],
  currentCorrectId: null,
  currentQuestionSet: [],
  termById: {},
  possibleAnswers: 5,
  questionIsTermPossability: 0.5,
  currentlyShowDefinition: true,
  currentSubmittedAnswers: {},
  currentAskedTime: null,
  init: function(set, players){
    this.remainingQuestions = [];
    this.termById = {};
    set.terms.forEach(function(term){
      game_QUIZUP.remainingQuestions.push(term.id);
      game_QUIZUP.termById[term.id] = term;
    });
    this._handOutQuestions();
  },
  handleAnswer: function(senderId, correctId, guessedId) {
    this.currentSubmittedAnswers[senderId] = {
      guessed: guessedId,
      correctId: correctId,
      time: new Date(),
    }
    this._handleChange();
  },
  removePlayer: function(senderId) {
    delete this.currentSubmittedAnswers[senderId];
    this._handleChange();
  },
  addPlayer: function(senderId, player) {
    this.currentSubmittedAnswers[senderId] = null;
    broadcastObjective({
      senderId: senderId,
      correctId: this.currentCorrectId,
      possibleIds: this.currentQuestionSet,
      showDefinition: this.currentlyShowDefinition,
    });
    this._handleChange();
  },
  _handleChange: function() {
    var allGuessed = Object.keys(this.currentSubmittedAnswers).reduce(function(prev, senderId) {
      if (!gameState.players[senderId] || !gameState.players[senderId].username) {
        console.log("User bailed from game, ignoring in end game feature");
        return prev;
      }
      return prev && game_QUIZUP.currentSubmittedAnswers[senderId];
    }, true);
    if (!allGuessed) {
      game_QUIZUP._updatePlayersGuessedUi();
    } else {
      game_QUIZUP._handleAllAnswered();
    }
  },
  _handleAllAnswered: function() {
    console.log("> _handleAllAnswered");
    vm.currentQuestionText(null);
    vm.currentQuestionImage(null);
    var term = this.termById[this.currentCorrectId];
    vm.currentQuestionText((!this.currentlyShowDefinition) ? term.definition : term.term);
    if (!this.currentlyShowDefinition && term.image) {
      vm.currentQuestionImage({
        url: term.image.url,
        w: term.image.width,
        h: term.image.height,
      })
    } else {
      vm.currentQuestionImage(null);
    }
    var s = "<div style='font-size: 30pt; padding-bottom: 2%'>was the correct answer</div>";
    Object.keys(this.currentSubmittedAnswers).forEach(function(senderId) {
      if (!gameState.players[senderId] || !gameState.players[senderId].username) {
        console.log("User bailed from game, ignoring in UI");
        return;
      }
      var guessState = (game_QUIZUP.currentSubmittedAnswers[senderId].guessed == game_QUIZUP.currentSubmittedAnswers[senderId].correctId) ? 'correct' : 'incorrect';
      var delta = moment.duration(game_QUIZUP.currentSubmittedAnswers[senderId].time - game_QUIZUP.currentAskedTime).asSeconds();
      delta = Math.round(delta * 10)/10;
      var time = delta + " sec";
      console.log("User ",senderId," just got ",delta," -- adding to ",gameState.players[senderId].score,"? maybe : ",guessState);
      if (guessState == 'correct') {
        gameState.players[senderId].score = Math.round(gameState.players[senderId].score*10 + 10/delta * 10)/10;
      }
      vm.playerBySenderId(senderId).score(gameState.players[senderId].score);
      var username = gameState.players[senderId].username;
      s += "<div class='user-answer-state "+guessState+"'><div class='player'>"+username+"</div><div class='time'>"+time+"</div></div>";
    });
    s += "</div>";
    vm.currentQuestionExtra(s);
    broadcastState("Everyone answered the questions");
    console.log("Enqueueueueueing the timeout");
    this._startCountDown();
  },
  _startCountDown: function() {
    $(".countDown").remove();
    $("body").append("<div class='countDown'></div>");
    var max = 10;
    for(var i = 1; i <= max; ++i) {
      (function(t) {
        console.log(".... ",t);
        setTimeout(function() {$(".countDown").text(t);}, (max - t) * 1000);
      })(i);
    }
    setTimeout(function() {
      console.log("GO!");
      $(".countDown").remove();
      game_QUIZUP._handOutQuestions();
    }, max * 1000);
  },
  _shuffleList: function(list) {
    for (var i = 0; i < list.length; ++i) {
      var newIndex = Math.floor(Math.random() * list.length);
      var temp = list[newIndex];
      list[newIndex] = list[i];
      list[i] = temp;
    }
  },
  _updatePlayersGuessedUi: function() {
    console.log("> _updatePlayersGuessedUi");
    var s = "";
    Object.keys(this.currentSubmittedAnswers).forEach(function(senderId) {
      if (!gameState.players[senderId] || !gameState.players[senderId].username) {
        console.log("User bailed from game, ignoring in UI");
        return;
      }
      var guessState = (game_QUIZUP.currentSubmittedAnswers[senderId]) ? 'answered' : 'unanswered';
      var username = gameState.players[senderId].username;
      s += "<div class='user-answer-state "+guessState+"'><div class='player'>"+username+"</div></div>";
    });
    vm.currentQuestionExtra(s);
  },
  _handleEndGame: function() {
    vm.currentQuestionText("GAME OVER");
    gameState.state = 'ENDED';
    broadcastState('Game over, man. Game over');
  },
  _handOutQuestions: function() {
    vm.currentQuestionExtra("");
    console.log("> _handOutQuestions");
    if (this.remainingQuestions.length == 0) {
      this._handleEndGame();
      return;
    }
    this.currentQuestionSet = [];
    var possibleQuestions = Object.keys(this.termById);
    this._shuffleList(possibleQuestions);
    this._shuffleList(this.remainingQuestions);
    this.currentCorrectId = this.remainingQuestions.pop();

    this.currentQuestionSet.push(this.currentCorrectId);
    for(var i = 0; this.currentQuestionSet.length < this.possibleAnswers && i < possibleQuestions.length; ++i) {
      if (possibleQuestions[i] == this.currentCorrectId) {
        continue;
      } else {
        this.currentQuestionSet.push(parseInt(possibleQuestions[i]));
      }
    }

    this.currentlyShowDefinition = Math.random() < this.questionIsTermPossability;
    this.currentAskedTime = new Date();
    console.log("> _handOutQuestions : broadcast");
    broadcastObjective({
      correctId: this.currentCorrectId,
      possibleIds: this.currentQuestionSet,
      showDefinition: this.currentlyShowDefinition,
    });
    this.currentSubmittedAnswers = {};
    Object.keys(gameState.players).forEach(function(senderId) {
      game_QUIZUP.currentSubmittedAnswers[senderId] = false;
    });
    vm.isPlaying(true);
    var term = this.termById[this.currentCorrectId];
    vm.currentQuestionText((this.currentlyShowDefinition) ? term.definition : term.term);
    if (this.currentlyShowDefinition && term.image) {
      vm.currentQuestionImage({
        url: term.image.url,
        w: term.image.width,
        h: term.image.height,
      })
    } else {
      vm.currentQuestionImage(null);
    }
    console.log("> _handOutQuestions : ui updates");
    this._updatePlayersGuessedUi();
  }
}
