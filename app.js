var app = angular.module("app", ["xeditable", 'ngSanitize', 'directives', 'ngFileSaver']);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});

app.controller('EditableRowCtrl', ['$scope', 'FileSaver', 'Blob', '$http', function($scope, FileSaver, Blob, $http) {

  $scope.size = 1;
  $scope.directions = [{
    value: "L"
  }, {
    value: "R"
  }];
  $scope.stateArray = [{
    id: 'q0',
    columns: [{
      read: '0',
      state: 'q0',
      symbol: '0',
      direction: 'R'
    }, {
      read: '1',
      state: 'q0',
      symbol: '0',
      direction: 'R'
    }, {
      read: '2',
      state: 'q0',
      symbol: '0',
      direction: 'R'
    }, {
      read: 'X',
      state: 'q0',
      symbol: '0',
      direction: 'R'
    }, {
      read: 'Y',
      state: 'q0',
      symbol: '0',
      direction: 'R'
    }, {
      read: 'Z',
      state: 'q0',
      symbol: '0',
      direction: 'R'
    }, {
      read: 'b',
      state: 'F',
      symbol: '0',
      direction: 'R'
    }]
  }];

  $scope.head = {
    state_id: 'q0'
  };

  $scope.outputString = "";
  $scope.sequence = "";
  $scope.htmlOutput = "no output yet";
  $scope.textFileName = "";

  // Download turing machine description for later use
  $scope.download = function() {
    var jText = JSON.stringify($scope.stateArray);
    console.log(jText);
    var data = new Blob([jText], {
      type: 'text/plain;charset=utf-8'
    });
    console.log(data);
    FileSaver.saveAs(data, $scope.textFileName);
  };


  $scope.loadContent = function(fileContent) {

    $scope.fileContent = JSON.parse(fileContent);

    console.log($scope.fileContent);

    $scope.stateArray = $scope.fileContent;
    //  alert("loaded");
  };


  $scope.checkStateInput = function(data) {
    var re = /([q][0-9]+)|(F)/
    if (!re.test(data)) {
      return "invalid input";
    }
  };

  // remove user
  $scope.removeState = function(index) {
    $scope.stateArray.splice(index, 1);
  };

  // add user
  $scope.addState = function() {
    $scope.inserted = {
      id: '',
      columns: [{
        read: '0',
        state: '',
        symbol: '',
        direction: ''
      }, {
        read: '1',
        state: '',
        symbol: '',
        direction: ''
      }, {
        read: '2',
        state: '',
        symbol: '',
        direction: ''
      }, {
        read: 'X',
        state: '',
        symbol: '',
        direction: ''
      }, {
        read: 'Y',
        state: '',
        symbol: '',
        direction: ''
      }, {
        read: 'Z',
        state: '',
        symbol: '',
        direction: ''
      }, {
        read: 'b',
        state: '',
        symbol: '',
        direction: ''
      }]
    };
    $scope.size++;
    $scope.stateArray.push($scope.inserted);
  };

  $scope.loadExample = function(){
    $http.get("examples/palindromes.txt")
      .then(function(response) {

          $scope.stateArray = response.data;


      });
  };

  $scope.run = function() {
    // Max 5000 iterations
    var timer = 5000;
    var halt = false;
    var found = false;
    var index = 0;
    var currChar = $scope.sequence[0];

    var sequenceArray = [];
    // Setting (or resetting ) head
    $scope.head.state_id = $scope.stateArray[0].id;

    // Making an array out of the sequences string
    for (var i = 0; i < $scope.sequence.length; i++) {
      sequenceArray.push($scope.sequence.charAt(i));
    }

    // duplicating the sequence array
    var arrJoin = sequenceArray.slice(0);

    // putting the head symbol at array 0
    arrJoin.splice(index, 0, "@");

    // Outputting the array without commas
    console.log("sequence:" + arrJoin.join(""));
    $scope.htmlOutput = "state: " + $scope.head.state_id + " ; sequence: " + arrJoin.join("");

    while (!halt) {

      // Traversing the state array by row
      for (var i = 0;
        (i < $scope.stateArray.length) && (!found); i++) {
        // Checking if state id is equal to the one we're in . Initially q0, then based on new state
        if ($scope.stateArray[i].id == $scope.head.state_id) {

          // Traversing current row by column
          for (var j = 0;
            (j < $scope.stateArray[i].columns.length) && (!found); j++) {
            // Checking if read character is equal to the one that the head is
            // pointing at (in the input sequence)
            if (currChar == $scope.stateArray[i].columns[j].read) {
              if ($scope.stateArray[i].columns[j].state == '') {
                writeString("<b>state:</b> " + $scope.head.state_id +
                  " || read: " + $scope.stateArray[i].columns[j].read +
                  " || CRASH");
                break;
              }
              // writing new character in place of the old one
              sequenceArray[index] = $scope.stateArray[i].columns[j].symbol;
              //  changing state of the head
              $scope.head.state_id = $scope.stateArray[i].columns[j].state;

              // Shifting head left or right
              if ($scope.stateArray[i].columns[j].direction == 'R') {
                index++;
              } else {
                index--;
              }
              // Checking if reached end of input sequence
              if (index == sequenceArray.length) {
                // If yes, pushing a blank symbol in front of the head
                sequenceArray.push("b");
              }
              // Checking if head is at index -1
              else if (index < 0) {
                // If yes, adding a blank symbol at the beginning
                sequenceArray.unshift("b");
                index = 0;
              }
              // Getting current character based on head position
              currChar = sequenceArray[index];

              // copying array
              var arrJoin = sequenceArray.slice(0);
              // adding head symbol to copy
              arrJoin.splice(index, 0, "@");
              // displaying array
              writeString("state: " + $scope.stateArray[i].id +
                " &nbsp  || &nbsp  read: " + $scope.stateArray[i].columns[j].read +
                " &nbsp  || &nbsp  new state: " + $scope.head.state_id +
                " &nbsp  || &nbsp  write: " + $scope.stateArray[i].columns[j].symbol +
                " &nbsp  || &nbsp  direction: " + $scope.stateArray[i].columns[j].direction +
                " &nbsp  || &nbsp  sequence: " + arrJoin.join(""));
              // indicating that we made a transition
              found = true;
            }
          }
        }
      }
      // If no transition was made, it's time to halt
      if (!found) {
        halt = true;
      } else {
        // if new state id is F, it is time to halt
        if ($scope.head.state_id == 'F') {
          writeString("state: " + $scope.head.state_id  +
                      " || sequence: " + arrJoin.join("") +
                      " || HALT (SUCCESS)");
          halt = true;
        } else {
          found = false;
          timer--;
          if (timer == 0) {
            halt = true;
            writeString("Halting - max number of iterations is 5000");
          } else if (index >= 100) {
            halt = true;
            writeString("Halting - max sequence size is 100")
          }
        }
      }
    }
  };


  function writeString(string) {
    console.log(string);
    $scope.htmlOutput += "<br>" + string;
    $scope.outputString = string;
  };

}]);
