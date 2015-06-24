angular.module('main', ['ngRetina'])
    .controller('main', function($scope,$interval,$compile) {
        $scope.scroll = {
            min: 0,
            max: $(document).height() - $(window).height()
        }

        $scope.data = {
            stories: null,
            energy: {
                electricity: null,
                gas: null
            }
        }

        $scope.go = false

        function isNumber(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function sanitise(res) {
            var data = _.map(res.rows, 'cells')
            data.shift()
            _.each(data, function(datum,i) {
                _.each(datum, function(cell,r) {
                    if(isNumber(cell)) {
                        data[i][r] = parseFloat(cell)
                    }
                })
            })
            return data
        }

        // Load stories
        sheetrock({
            url: "https://docs.google.com/spreadsheets/d/1H2LfFYENiV-JQsbNcrCZfcSdtNKwwodW7Uw8D6TqagQ/edit#gid=1129478908",
            query: "select A,B,C,D,E,F,G",
            callback: function loadedStoryData(err, opts, res) {
                $scope.data.stories = sanitise(res);
                $scope.$apply()
                $scope.onLoaded('stories')
            }
        });

        // Load electricity price data
        sheetrock({
            url: "https://docs.google.com/spreadsheets/d/18ZaRqew2LHWCqTfTjvu6jWwfzJhe1Fo7BS8oJogVECY/edit#gid=0",
            query: "select A,B,C,D,E,F,G,H,I,J,K,L",
            callback: function loadedElectricityData(err, opts, res) {
                $scope.data.energy.electricity = sanitise(res)
                $scope.$apply()
                $scope.onLoaded('elec')
            }
        });

        // Load gas price data
        sheetrock({
            url: "https://docs.google.com/spreadsheets/d/1TlsgORKIbG1NqPhdGXBnDrPXO_Lev11l7DJF9IN3OQA/edit#gid=0",
            query: "select A,B,C,D,E,F,G,H,I,J",
            callback: function loadedGasData(err, opts, res) {
                $scope.data.energy.gas = sanitise(res)
                $scope.$apply()
                $scope.onLoaded('gas')
            }
        });

        // Check for data loaded
        var loaded = {}
        $scope.onLoaded = function(from) {
            if(loaded[from]) return false;
            console.log("LOADED "+from)

            loaded[from] = true;
            var requiredObjs = [$scope.data.stories, $scope.data.energy.electricity, $scope.data.energy.gas];
            if(_.all(requiredObjs, function(datum) {
                return typeof datum !== 'undefined' && datum !== null
            })) {
                $scope.go = true
                $scope.init();
            }
        }

        // Scroll ranges
        $scope.init = function() {
            $scope.dates = {
                min: QYtoDate($scope.data.energy,$scope.data.energy.electricity[0]),
                max: QYtoDate($scope.data.energy,$scope.data.energy.electricity[$scope.data.energy.electricity.length-1])
            }

            $scope.ticks = $scope.data.energy.electricity.length

            $scope.setIndex($scope.data.energy.electricity[1])
        }

        $scope.getStories = function() {
            if(!$scope.go) return false;

            return $scope.data.stories;
        }

        $scope.getRange = function() {
            if(!$scope.go) return false;

            return $scope.data.energy.electricity;
        }

        $scope.onGo = function() {
            return $scope.go
        }

        $scope.loadedData = function() {
            if(!$scope.go) return 0;
            return $scope.data;
        }

        $scope.atIndex = function() {
            if(!$scope.go) return 0;

            var perc = ($scope.scrollDistance / ($scope.scroll.max))
            return Math.round($scope.ticks * perc)
        }

        $scope.setIndex = function(story) {
            if(!$scope.go) return 0;
            setIndex($scope.data.energy.electricity,story)
        }
    })

function setIndex(range,story) {
    var i = _.findIndex(range, function(evt) {
        return evt.quarter === story.quarter && evt.year === story.year
    })

    var perc = (i / range.length)
    var max = $(document).height() - $(window).height()

    $(window).scrollTop(perc * max)
}