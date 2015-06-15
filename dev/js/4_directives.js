angular.module('main')
    .directive("scroll", function ($window) {
        return function(scope, element, attrs) {
            angular.element($window).bind("scroll", calcScrolled)

            element.addClass('scrolled-true')

            function calcScrolled() {
                scope.scrollDistance = this.pageYOffset
                 if (this.pageYOffset >= attrs.scroll) {
                     scope.scrolled = true
                     element.addClass('scrolled-true')
                     element.removeClass('scrolled-false')
                 } else {
                     scope.scrolled = false
                     element.removeClass('scrolled-true')
                     element.addClass('scrolled-false')
                 }
                scope.$apply()
            }

            calcScrolled()
        }
    })