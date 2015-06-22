angular.module('main', ['ngRetina'])
    .controller('main', function($scope,$interval,$compile) {
        // Selectors
        $scope.data = data
        $scope.stories = data.stories
        $scope.energy = data.energy

        // Scroll ranges
            $scope.dates = {
                min: QYtoDate(data.energy.electricity[0]),
                max: QYtoDate(data.energy.electricity[data.energy.electricity.length-1])
            }

            $scope.ticks = data.energy.electricity.length

            $scope.scroll = {
                min: 0,
                max: 20000 - $(window).height()
            }

        $scope.atIndex = function() {
            var perc = ($scope.scrollDistance / ($scope.scroll.max))
            return Math.round($scope.ticks * perc)
        }
    })