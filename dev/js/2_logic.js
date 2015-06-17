angular.module('main', ['ngRetina'])
    .controller('main', function($scope,$interval,$compile) {
        // Selectors
        $scope.stories = data.stories
        $scope.energy = data.energy

        // Graph functions
        $scope.drawChart = drawChart
        $scope.drawChart()

        $scope.drawData = drawData
        _.each($scope.energy, function(energy,energyName) {
            $scope.drawData(energy,energyName)
        })

        // Stories
        $scope.animationPhase = function() {
            return true;
        }

        $scope.index = 1
        $scope.atIndex = function() {
            console.log($scope.index)
            return $scope.index
        }

        $interval(function() {
            $scope.index++
            console.log($scope.index)
        },600)
    })