angular.module('main')
    .directive("scroll", function ($window) {
        return function(scope, element, attrs) {
            element.addClass('scrolled-true')
            scope.hasScrolled = false

            var calcScrolled = function() {
                var pageYOffset = $window.pageYOffset

                scope.scrollDistance = pageYOffset
                 if (pageYOffset >= attrs.scroll) {
                     scope.hasScrolled = true
                     scope.scrolled = true
                     element.addClass('has-scrolled')
                     element.addClass('scrolled-true')
                     element.removeClass('scrolled-false')
                 } else {
                     scope.scrolled = false
                     element.removeClass('scrolled-true')
                     element.addClass('scrolled-false')
                 }

                 scope.$apply()
            }

            $(window).bind("scroll", calcScrolled)

            calcScrolled()
        }
    })
    .directive("dateListIterator", function($window) {
        return {
            scope: {
                index: '=',
                range: '=',
                list: '=dateListIterator',
                go: '='
            },
            link:function(scope, element, attrs) {
                function indexFromGlobalIndex() {
                    var indexDate = QYtoDate(scope.range[scope.index])
                    var nearestPastStory = _.findLastIndex(scope.list, function(story) {
                        return QYtoDate(story) <= indexDate
                    })
                    return nearestPastStory
                }

                function updateShift() {
                    var $group = $(element).find("[date-list-iteration-group]")
                    var $item = $(element).find("[date-list-iteration-item]")
                    var value = indexFromGlobalIndex() * $item.outerWidth()
                    $group.css("width", "100%")
                    $group.css("margin-left", -value)
                    if(value < 0) {
                        $group.addClass('prehistoric')
                        $group.removeClass('historic')
                    } else {
                        $group.removeClass('prehistoric')
                        $group.addClass('historic')
                    }
                    $(".highlighted").removeClass('highlighted')
                    var storyIndex = indexFromGlobalIndex() + 1
                    $("[date-list-iteration-item]:nth-child("+storyIndex+")").addClass("highlighted")
                }

                scope.$watch("go", function() {
                    if(scope.go) {
                        scope.$watch("index", updateShift, true);
                    }
                }, true);
            }
        }
    })

    // <div date-list-iterator index="atIndex()" list="stories" >