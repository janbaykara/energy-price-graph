var leewayTop = 0
var SCROLL_DISTANCE = 25000
var spatialRange = {
    min: 0 + leewayTop,
    max: SCROLL_DISTANCE - $(window).height() - leewayTop
}
$(window).scrollTop(0)

angular.module('main', ['ngRetina'])
    .controller('main', function($scope,$interval) {
        $scope.go = false
        $scope.index = 0

        $scope.UI = {
            introPhase: true,
            summaryPhase: false,
            detailPhase: false,
            dataLoaded: false,
            graphFilled: false
        }

        $scope.documentHeight = function() {
            return "height: "+($scope.UI.introPhase ? $(window).height() : SCROLL_DISTANCE) +'px !important'
        }

        $scope.sources = {
            stories:      "https://docs.google.com/spreadsheets/d/140T4PZE5K7Hrnn2gV6ZOJojcX3dRFENr16m5LFJQ74s/edit#gid=1108467446",
            electricity:  "https://docs.google.com/spreadsheets/d/16IfQH23bpHdzvY6-IhJ8FAd6rx_nLh-2tnOFkZlwAKA/edit#gid=0",
            gas:          "https://docs.google.com/spreadsheets/d/1FCS8w-_YndjmmB8xT-sI4j7KPaALGKZiuAv5VWbvZ2k/edit#gid=0"
        }

        $scope.data = {
            stories: null,
            energy: {
                electricity: null,
                gas: null
            }
        }

        $scope.spatialRange = spatialRange

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
                $scope.$apply(function() {
                    $scope.data.stories = sanitise(res);
                    $scope.onLoaded('stories')
                })
            }
        });

        // Load electricity price data
        sheetrock({
            url: $scope.sources.electricity, // Published
            query: "select A,B,C,D,E,F,G,H,I,J,K,L",
            callback: function loadedElectricityData(err, opts, res) {
                $scope.$apply(function() {
                    $scope.data.energy.electricity = sanitise(res)
                    $scope.onLoaded('elec')
                })
            }
        });

        // Load gas price data
        sheetrock({
            url: $scope.sources.gas, // Published
            query: "select A,B,C,D,E,F,G,H,I,J",
            callback: function loadedGasData(err, opts, res) {
                $scope.$apply(function() {
                    $scope.data.energy.gas = sanitise(res)
                    $scope.onLoaded('gas')
                })
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
            console.log($scope.data)

            $scope.dataRange = $scope.data.energy.electricity
            $scope.ticks = $scope.dataRange.length
            $scope.lastColumn = $scope.dataRange[$scope.ticks-1]

            $scope.dates = {
                min: QYtoDate( $scope.data.energy, $scope.dataRange[0] ),
                max: QYtoDate( $scope.data.energy, $scope.dataRange[$scope.ticks-1] )
            }

            $scope.useableStories = _.filter($scope.data.stories, function(story) {
                return story.year <= $scope.lastColumn.year
                    && (story.year === $scope.lastColumn.year ? story.quarter <= $scope.lastColumn.quarter : true)
            });
            $scope.UI.dataLoaded = true
            // $scope.$apply()
        }

        $scope.anim = function() {
            $scope.animCount = 0
            $scope.animTickDuration = 100
            $scope.UI.introPhase = false
            $scope.UI.summaryPhase = true
            //
            $scope.goToTick($scope.dataRange[0])
            $scope.animInterval = $interval($scope.animateProgress, $scope.animTickDuration)
        }

        $scope.animateProgress = function () {
            $interval.cancel($scope.animInterval)
            ///
            var nowTick = $scope.dataRange[$scope.animCount]
            if($scope.animCount < $scope.ticks) {
                $scope.goToTick(nowTick)
                $scope.animCount++
                $scope.animInterval = $interval($scope.animateProgress, $scope.animTickDuration)
            } else {
                $scope.UI.graphFilled = true
                $scope.UI.summaryPhase = false
                $scope.UI.detailPhase = true
                $interval.cancel($scope.animInterval)
                $scope.goToTick($scope.useableStories[$scope.useableStories.length-1])
            }
        }

        //////

        $scope.onGo = function() {
            return $scope.go
        }

        $scope.getStories = function() {
            if(!$scope.go) return false;
            return $scope.useableStories;
        }

        $scope.getRange = function() {
            if(!$scope.go) return false;
            return $scope.dataRange;
        }

        $scope.loadedData = function() {
            if(!$scope.go) return 0;
            return $scope.data;
        }

        $scope.getIndex = function() {
            if(!$scope.go) return 0;
            $scope.index = ConvertScrollToIndex($scope.ticks, $scope.spatialRange, $scope.scrollDistance)
            return $scope.index
        }

        $scope.goToTick = function(story) {
            if(!$scope.go) return 0;
            goToTick($scope.dataRange, story)
        }
    })

function goToTick(indexRange, story) {
    var i = _.findIndex(indexRange, function(evt) {
        return evt.quarter === story.quarter && evt.year === story.year
    })
    $(window).scrollTop( ConvertIndexToScroll(indexRange.length, spatialRange, i) )
}

function ConvertIndexToScroll(indexLength, spatialRange, index) {
    var indexPerc = index / indexLength
    var calculated = spatialRange.min + ( indexPerc * (spatialRange.max - spatialRange.min) )
    return calculated
}

function ConvertScrollToIndex(indexLength, spatialRange, scrollYPosn) {
    var spatialPerc = ( Math.max(scrollYPosn - spatialRange.min, 0) ) / spatialRange.max
    var calculated = Math.round(indexLength * spatialPerc)
    return calculated
}
