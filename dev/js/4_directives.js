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
    .directive("dateListIterator", function($window) {
        return {
            scope: {
                index: '='
            },
            link:function(scope, element, attrs) {
                function indexFromGlobalIndex() {
                    var indexDate = QYtoDate(data.energy.electricity[scope.index])
                    var nearestPastStory = _.findLastIndex(data.stories, function(story) {
                        return QYtoDate(story) < indexDate
                    }) + 2
                    console.log(nearestPastStory)
                    return nearestPastStory
                }

                function updateShift() {
                    var $group = $(element).find("[date-list-iteration-group]")
                    var $item = $(element).find("[date-list-iteration-item]")
                    var value = indexFromGlobalIndex() * $item.width()
                    $group.css("width", "100%")
                    $group.css("margin-left", -value)
                    $(".highlighted").removeClass('highlighted')
                    $("[date-list-iteration-item]:nth-child("+indexFromGlobalIndex()+")").addClass("highlighted")
                }

                scope.$watch("index", updateShift, true);
            }
        }
    })

    // <div date-list-iterator index="atIndex()" list="stories" >