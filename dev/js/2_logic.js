angular.module('main', ['ngRetina'])
    .controller('main', function($scope) {
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
    })