angular.module('main', ['ngRetina'])
    .controller('main', function($scope) {
        // Selectors
        $scope.energy = data.energy
        $scope.energySelector = 'electricity'
        $scope.selectedEnergy = function(name,value) {
            $scope.energySelector = name
            $scope.drawData()
        }

        // Graph functions
        $scope.drawChart = drawChart
        $scope.drawChart()

        $scope.drawData = function() {
            drawData($scope.energy[$scope.energySelector])
        }
        $scope.drawData()
    })