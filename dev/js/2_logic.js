angular.module('main', ['ngRetina'])
    .controller('main', function($scope,$interval,$compile) {
        // Selectors
        $scope.data = data
        $scope.stories = data.stories
        $scope.energy = data.energy

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