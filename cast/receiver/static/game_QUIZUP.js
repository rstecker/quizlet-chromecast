game_QUIZUP = {
  currentAnswerSet: [],
  remainingQuestions: [],
  currentCorrectId: null,
  currentQuestionSet: [],
  termById: {},
  possibleAnswers: 5,
  questionIsTermPossability: 0.5,
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
  },
  addPlayer: function(senderId, player) {
  },
  _handOutQuestions: function() {
    if (this.remainingQuestions.length == 0) {
      this._handleEndGame();
      return;
    }
    this.currentQuestionSet = [];
    var possibleQuestions = Object.keys(this.termById);
    this._shuffleQuestions(possibleQuestions);
    this._shuffleQuestions(this.remainingQuestions);
    this.currentCorrectId = this.remainingQuestions.pop();

    this.currentQuestionSet.push(this.currentCorrectId);
    for(var i = 0; i < this.possibleAnswers; ++i) {
      if (this.possibleQuestions[i] == this.currentCorrectId) {
        --i;
      } else {
        this.currentQuestionSet.push(this.possibleQuestions[i]);
      }
    }

    this.currentlyShowDefinition = Math.random() < this.questionIsTermPossability;

    broadcastObjective({
      correctId: this.currentCorrect,
      possibleIds: this.currentQuestionSet,
      showDefinition: this.currentlyShowDefinition,
    });
      vm.isPlaying(true);
      var term = this.termById[this.currentCorrect];
      vm.currentQuestionText("What is the answer to: " + ((this.currentlyShowDefinition) ? term.definition : term.term));
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
