(function() {
    var app = angular.module("rockPaperScissors", []);

    // This is just to show that we can add other options later and is done for scalability of the app
    var availableMoves = [{
        name: "Rock"
    }, {
        name: "Paper"
    }, {
        name: "Scissors"
    }];

    app.controller("HeadingController", function() {
        this.title = null;
        this.title = "Rock, Paper, Scissors";
    });

    app.controller('PlayerController', ['scoreKeeper', function(scoreKeeper) {
        this.players = scoreKeeper.getPlayerData();
    }]);

    app.controller("MovesController", ['scoreKeeper', function(scoreKeeper) {
        this.moves = scoreKeeper.getMoveData();
    }]);

    app.controller("ScoreController", ['scoreKeeper', function(scoreKeeper) {
        this.scores = scoreKeeper.getScores();
    }]);

    app.controller('GameController', ['scoreKeeper', '$scope', '$timeout', function(scoreKeeper, $scope, $timeout) {
        this.game = scoreKeeper;

        this.selectedMove = function(element) {

            // Get player array
            $scope.players = this.game.getPlayerData();

            // Get score data
            $scope.scoreData = this.game.getScores();

            // Get each players' chosen move
            $scope.computerMove = this.game.getComputersMove();
            $scope.yourMove = this.game.getYourMove();
            $scope.results = this.game.calculateWinner($scope.yourMove, $scope.computerMove);

            // Clear the players' previous move choices
            angular.forEach($scope.players, function(value, index) {
                value.chosen = null;
            })

            $timeout(function() {
                
                angular.forEach($scope.players, function(value, index) {
                    if (value.id == 'you') {
                        value.chosen = $scope.yourMove.id;
                    } else if (value.id == 'computer') {
                        value.chosen = $scope.computerMove.id;
                    }
                })

                if ($scope.results.winner == 'tie') {
                    $scope.scoreData.ties += 1;
                } else {
                    if ($scope.results.winner == 'you') {
                        $scope.scoreData.yourWins += 1;
                    } else {
                        $scope.scoreData.computerWins += 1;
                    }
                }
            }, 3000);
        }
    }])

    // This service: scorekeeper handles our scoring
    app.service('scoreKeeper', ['$filter', function($filter) {

        // Initialize the scores
        var scores = {
            yourWins: 0,
            ties: 0,
            computerWins: 0
        };

        // Lets specify the players
        var players = [
            { id: 'you', name: 'You', chosen: null },
            { id: 'computer', name: 'Computer', chosen: null },
        ];

        // Lets then specify our moves based on the wikipedia page
        var movesList = {
            'rock': {
                id: 'rock',
                name: 'Rock',
                chosen: false,
                defeats: [
                    { verb: 'beats', id: 'scissors' }
                ]
            },
            'paper': {
                id: 'paper',
                name: 'Paper',
                chosen: false,
                defeats: [
                    { verb: 'beats', id: 'rock' }
                ]
            },
            'scissors': {
                id: 'scissors',
                name: 'Scissors',
                chosen: false,
                defeats: [
                    { verb: 'beats', id: 'paper' }
                ]
            }
        };

        // This function returns our current score
        this.getScores = function() {
            return scores;
        }

        // We can also write functions to get player and move data
        this.getPlayerData = function() {
            return players;
        }

        this.getMoveData = function() {
            return movesList;
        }

        // Now that we have defined our moves list, returns for player data and move data, lets use this to find the winner
        this.yourSelection = null;

        this.getYourMove = function() {
            this.moveData = this.getMoveData();
            this.yourSelectionObject = this.moveData[this.yourSelection];

            return this.yourSelectionObject;
        }

        this.getComputersMove = function() {
            this.computerMoves = this.getMoveData();
            // Now lets get the keys from the retrieved move data
            this.getKeys = Object.keys(this.computerMoves);
            var randomNumber = Math.floor(Math.random() * this.getKeys.length);
            this.getRandomComputerMove = this.getKeys[randomNumber];
            // and now finally, lets get the computer move
            this.computerMoveObject = this.computerMoves[this.getRandomComputerMove];

            return this.computerMoveObject;
        }

        this.calculateWinner = function(yourMove, computerMove) {
            this.moveData = this.getMoveData();
            this.winner = null;
            this.resultText = "";

            if (yourMove.id == computerMove.id) {
                this.winner = "tie";
                this.resultText = "Its a Tie";
            } else {
                var yourWin = $filter('arrayContains')(yourMove.defeats, computerMove.id);

                if (yourWin) {
                    this.winner = 'human';
                    this.resultText = 'You win! ' + yourMove.name + ' ' + yourWin.verb + ' ' + yourWin.id + '.';
                } else {
                    var computerWin = $filter('arrayContains')(computerMove.defeats, yourMove.id);
                    this.winner = 'robot';
                    this.resultText = 'Computer wins! ' + computerMove.name + ' ' + computerWin.verb + ' ' + computerWin.id + '.';
                }
            }

            // And this gives us the final winner
            var finalResult = { winner: this.winner, resultText: this.resultText };

            return finalResult;
        }

        // filter for finding keys in objects
        app.filter('arrayContains', function() {
            return function(items, field) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].id == field) {
                        return input[i];
                    }
                }
                return false;
            };
        });
    }]);

})();
