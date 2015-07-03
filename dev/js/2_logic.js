angular.module('main', ['ngRetina'])
    .controller('main', function($scope,$timeout) {

        $scope.go = false

        $scope.expandValue = false

        $scope.sources = {
            stories: "https://docs.google.com/spreadsheets/d/140T4PZE5K7Hrnn2gV6ZOJojcX3dRFENr16m5LFJQ74s/edit#gid=1108467446",
            electricity: "https://docs.google.com/spreadsheets/d/16IfQH23bpHdzvY6-IhJ8FAd6rx_nLh-2tnOFkZlwAKA/edit#gid=0",
            gas: "https://docs.google.com/spreadsheets/d/1FCS8w-_YndjmmB8xT-sI4j7KPaALGKZiuAv5VWbvZ2k/edit#gid=0"
        }
        console.log($scope.sources)

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
            url: $scope.sources.stories, // Published
            query: "select A,B,C,D,E,F,G",
            callback: function loadedStoryData(err, opts, res) {
                $scope.data.stories = sanitise(res);
                // $scope.$apply()
                $scope.onLoaded('stories')
            }
        });

        // Load electricity price data
        sheetrock({
            url: $scope.sources.electricity, // Published
            query: "select A,B,C,D,E,F,G,H,I,J,K,L",
            callback: function loadedElectricityData(err, opts, res) {
                $scope.data.energy.electricity = sanitise(res)
                // $scope.$apply()
                $scope.onLoaded('elec')
            }
        });

        // Load gas price data
        sheetrock({
            url: $scope.sources.gas, // Published
            query: "select A,B,C,D,E,F,G,H,I,J",
            callback: function loadedGasData(err, opts, res) {
                $scope.data.energy.gas = sanitise(res)
                // $scope.$apply()
                $scope.onLoaded('gas')
            }
        });

        // Check for data loaded
        var loaded = {}
        $scope.onLoaded = function(from) {
            if(loaded[from] === true) return false;
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

            yars = _.uniq(_.map($scope.data.energy.electricity,'year'));
            $scope.useableStories = _.filter($scope.data.stories, function(y) {
                return _.any(yars,function(x) { return x === y.year })
            });

            // if($(window).width() < 680) {
            //     $scope.setIndex($scope.data.energy.electricity[43])
            // }
            // $timeout(function() {
                $scope.setIndex($scope.data.energy.electricity[0])
                // $timeout(function() {
                    $('body').removeClass('loading')
                // },50)
            // },10)
        }

        $scope.getStories = function() {
            if(!$scope.go) return false;

            return $scope.useableStories;
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

        $scope.toggleExpand = function() {
            console.log("Clicked #stories")
            $scope.expandValue = !$scope.expandValue
        }

        $scope.getExpand = function() {
            console.log("Getting .expandValue",$scope.expandValue)
            return $scope.expandValue
        }

        $scope.$watch('expandValue', function(x,y) {
            $('#data-view').attr('class', x ? 'expanded' : 'discrete' )
        })
    })

function setIndex(range,story) {
    var i = _.findIndex(range, function(evt) {
        return evt.quarter === story.quarter && evt.year === story.year
    })

    var perc = (i / range.length)
    var max = $(document).height() - $(window).height()

    $(window).scrollTop(perc * max)
}