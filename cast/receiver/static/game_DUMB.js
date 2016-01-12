game_DUMB = {
  remainingQuestions: [],
  currentQuestionSet: [],
  setSize: 5,
  termById: {},
  questionIsTermPossability: 0.5,
  currentCorrect: 0,
  currentlyShowDefinition: false,
  init: function(set, players){
    this.remainingQuestions = [];
    this.termById = {};
    set.terms.forEach(function(term){
      game_DUMB.remainingQuestions.push(term.id);
      game_DUMB.termById[term.id] = term;
    });
    vm.currentQuestionExtra("");
    this._handOutQuestions();
  },
  handleAnswer: function(senderId, correctId, guessedId) {
    var playerUi = vm.playerBySenderId(senderId);
    if (correctId == this.currentCorrect && correctId == guessedId) {
      displayAction("Player "+senderId+" totally got the answer RIGHT");
      // update score in UI and view
      gameState.players[senderId].score += 1;
      broadcastState("Player "+senderId+" got a correct question");
      this._handOutQuestions();
    } else {
      displayAction("Player "+senderId+" totally guessed WRONG");
      gameState.players[senderId].score -= 0.5;
      broadcastState("Player "+senderId+" got an incorrect question");
    }
    playerUi.score(gameState.players[senderId].score);
  },
  removePlayer: function(senderId) {
    console.log("user dropped and I don't care")
  },
  addPlayer: function(senderId, player) {
    broadcastObjective({
      senderId: senderId,
      correctId: this.currentCorrect,
      possibleIds: this.currentQuestionSet,
      showDefinition: this.currentlyShowDefinition,
    });
  },
  _handleEndGame: function() {
    vm.currentQuestionText("HEY YOU GUYS! THE GAME IS OVER!");
    gameState.state = 'ENDED';
    broadcastState('Game over, man. Game over');
  },
  _shuffleQuestions: function() {
    for (var i = 0; i < this.remainingQuestions.length; ++i) {
      var newIndex = Math.floor(Math.random() * this.remainingQuestions.length);
      var temp = this.remainingQuestions[newIndex];
      this.remainingQuestions[newIndex] = this.remainingQuestions[i];
      this.remainingQuestions[i] = temp;
    }
  },
  _handOutQuestions: function() {
    if (this.remainingQuestions.length == 0) {
      this._handleEndGame();
      return;
    }
    this._shuffleQuestions();
    this.currentQuestionSet = [];
    for(var i = 0; i < this.setSize && i < this.remainingQuestions.length; ++i) {
      this.currentQuestionSet.push(this.remainingQuestions[i]);
    }
    this.currentCorrect = this.currentQuestionSet[0];
    var removalIndex = this.remainingQuestions.indexOf(this.currentCorrect);
    if (removalIndex > -1) {
      this.remainingQuestions.splice(removalIndex, 1);
    }
    this.currentlyShowDefinition = Math.random() < this.questionIsTermPossability;
    broadcastObjective({
      correctId: this.currentCorrect,
      possibleIds: this.currentQuestionSet,
      showDefinition: this.currentlyShowDefinition,
    });
    vm.isPlaying(true);
    var term = this.termById[this.currentCorrect];
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
  }
}
