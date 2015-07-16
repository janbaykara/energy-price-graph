var leewayTop = 0
var spatialRange = {
    min: 0 + leewayTop,
    max: $(document).height() - $(window).height() - leewayTop
}

angular.module('main', ['ngRetina'])
    .controller('main', function($scope,$interval) {
        $scope.go = false
        $scope.index = 0

        $scope.UI = {
            introPhase: false,
            summaryPhase: false,
            detailPhase: true,
            dataLoaded: false,
            graphFilled: false
        }

        $scope.sources = {
            stories:      "https://docs.google.com/spreadsheets/d/140T4PZE5K7Hrnn2gV6ZOJojcX3dRFENr16m5LFJQ74s/edit#gid=1108467446",
            electricity:  "https://docs.google.com/spreadsheets/d/16IfQH23bpHdzvY6-IhJ8FAd6rx_nLh-2tnOFkZlwAKA/edit#gid=0",
            gas:          "https://docs.google.com/spreadsheets/d/1FCS8w-_YndjmmB8xT-sI4j7KPaALGKZiuAv5VWbvZ2k/edit#gid=0"
        }
        console.log($scope.sources)

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
            $scope.ticks = $scope.data.energy.electricity.length
            $scope.lastColumn = $scope.data.energy.electricity[$scope.ticks-1]

            $scope.dates = {
                min: QYtoDate( $scope.data.energy, $scope.data.energy.electricity[0] ),
                max: QYtoDate( $scope.data.energy, $scope.data.energy.electricity[$scope.ticks-1] )
            }

            $scope.useableStories = _.filter($scope.data.stories, function(story) {
                return story.year <= $scope.lastColumn.year
                    && (story.year === $scope.lastColumn.year ? story.quarter <= $scope.lastColumn.quarter : true)
            });

            $scope.goToTick($scope.data.energy.electricity[0])
            $scope.UI.dataLoaded = true
        }

        $scope.anim = function() {
            var storyMaxN = $scope.useableStories.length - 1;
            var anim = 0
            var duration = initialDuration = 100
            var extendedDuration = initialDuration

            function animateProgress() {
                $interval.cancel(animInterval)
                ///
                var nowTick = $scope.data.energy.electricity[anim]
                if(anim < $scope.ticks) {
                    $scope.goToTick(nowTick)

                    var hasStory = _.any($scope.useableStories,function(someStory) {
                        return "Q"+nowTick.quarter+"Y"+nowTick.year === "Q"+someStory.quarter+"Y"+someStory.year
                    })

                    if(hasStory) duration = extendedDuration
                            else duration = initialDuration

                    anim++
                    animInterval = $interval(animateProgress, duration)
                } else {
                    $scope.goToTick($scope.lastColumn)
                    $scope.UI.introPhase = false
                    $scope.UI.graphFilled = true
                    $scope.UI.summaryPhase = false
                    $scope.UI.detailPhase = true
                    $interval.cancel(animInterval)
                }
            }

            var animInterval = $interval(animateProgress, duration)
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
            return $scope.data.energy.electricity;
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
            $scope.index = goToTick($scope.data.energy.electricity, story)
        }
    })

function goToTick(indexRange, story) {
    var i = _.findIndex(indexRange, function(evt) {
        return evt.quarter === story.quarter && evt.year === story.year
    })
    var scrollYPosn = ConvertIndexToScroll(indexRange.length, spatialRange, i)
    $(window).scrollTop(scrollYPosn)
    return scrollYPosn
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
