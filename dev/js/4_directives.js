angular.module('main')
    .directive("scroll", function ($window) {
        return function(scope, element, attrs) {
            angular.element($window).bind("scroll", calcScrolled)
            element.addClass('scrolled-true')
            scope.hasScrolled = false

            function calcScrolled() {
                scope.scrollDistance = this.pageYOffset
                 if (this.pageYOffset >= attrs.scroll) {
                     scope.hasScrolled = true
                     scope.scrolled = true
                     element.addClass('scrolled-true')
                     element.removeClass('scrolled-false')
                 } else {
                     scope.scrolled = false
                     element.removeClass('scrolled-true')
                     element.addClass('scrolled-false')
                 }
                scope.$digest()
            }

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
                    $(".highlighted").removeClass('highlighted')
                    var storyIndex = indexFromGlobalIndex() + 1
                    $("[date-list-iteration-item]:nth-child("+storyIndex+")").addClass("highlighted")
                }

                scope.$watch("go", function() {
                    if(scope.go) {
                        $(window).scrollTop(1);
                        scope.$watch("index", updateShift, true);
                    }
                }, true);
            }
        }
    })

    // <div date-list-iterator index="atIndex()" list="stories" >