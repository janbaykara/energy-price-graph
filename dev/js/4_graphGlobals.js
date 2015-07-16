var rowsN
var reached = 1
var transitionDuration = 0150
var yars
var dataRange

var scatters = [
    {
        path: 'verysmall',
        class: 'average_small',
        display: "V. small"
    },
    {
        path: 'small',
        class: 'average_small',
        display: "Small"
    },
    {
        path: 'smallmedium',
        class: 'average_small',
        display: "Small/med"
    },
    //
    {
        path: 'medium',
        class: 'average_large',
        display: "Medium"
    },
    {
        path: 'large',
        class: 'average_large',
        display: "Large"
    },
    {
        path: 'verylarge',
        class: 'average_large',
        display: "V. large"
    },
    {
        path: 'extralarge',
        class: 'average_large',
        display: "Extra large"
    }
]
var lines = [
    {
        path: 'average_small',
        class: 'average_small',
        display: "SMALL FIRMS"
    },
    {
        path: 'average_large',
        class: 'average_large',
        display: "BIG FIRMS"
    }
]

function QYtoDate(d) {
    return typeof d !== 'undefined' ? new Date(d.year, (d.quarter * 3) - 3) : new Date()
}

function dateToQY(d) {
    var quarter = Math.ceil((d.getMonth() + 1) / 3)
    var year = d.getFullYear()
    return (quarter == 1 ? year + " " : "") + "Q" + quarter
}

function dateToY(d) {
    var year = d.getFullYear() + ""
    return "'" + year.substring(2, 4)
}

function dPrev(data, i) {
    return data[i - 1 === -1 ? 0 : i - 1]
}

function getTickIndex(datum) {
    if(typeof datum === 'object') var datumDate = QYtoDate(datum)
    else var datumDate = datum
    var index = Math.max(_.findLastIndex(dataRange, function(d,i) { return QYtoDate(d) < datumDate }), 0)
    return index
}

function visibility(i, index) {
    var isValidYear = _.any(yars, function(x) {
        return x === dataRange[index].year
    })
    hidden = (index <= i || !checkRedraw()) && isValidYear
    return "visibility: "+(hidden ? 'hidden !important' : 'visible')
}

function reach(index) {
    reached = reached < index + 1 ? index + 1 : reached
}

function redraw() {
    return checkRedraw(function() {
        reached++
    })
}

function checkRedraw(func) {
    var totalrowsN = rowsN + ((scatters.length + lines.length) * 2)
    var check = reached - 1 < totalrowsN
    if (reached >= rowsN && reached <= totalrowsN) {
        if(typeof func === 'function') func()
    }
    return check
}

angular.module('main').
directive('graphChart', function($compile) {
    return {
        replace: false,
        scope: {
            data: '=graphChart',
            go: '=',
            index: '=?'
        },
        link: function(scope, element, attrs) {
            var scale, axis, axes, grids, stories, svg, lineOffset, years, quarterWidth
            var margin = {
                top: 2.5,
                right: 2.5,
                bottom: 5,
                left: 5
            }
            var w = "100%"
            var h = "100%"
            var pointSize = 2
            var canvasW = 100 - margin.left - margin.right

            var lineFunction = {}

            // Set up data

            scope.$watch("go", function() {
                if (scope.go) {
                    buildChart();
                }
            }, true);

            function onPoint(element,mouse) {
                var elementWidth = element.width.baseVal.value < 200 ? $(element).width() : element.width.baseVal.value
                var mouseXPerc = mouse[0] / elementWidth * 100
                var pointerDate = Date.parse(scale.x.invert(mouseXPerc))
                var pointerIndex = getTickIndex(pointerDate)
                var pointerTick = dataRange[pointerIndex]
                goToTick(dataRange, pointerTick)
                scope.$apply()
            }

            function buildChart() {
                dataRange = scope.data.energy.electricity
                rowsN = dataRange.length
                yars = _.uniq(_.map(dataRange, 'year'));
                quarters = (yars.length * 4) - 1
                quarterWidth = (canvasW / quarters)
                lineOffset = quarterWidth / 2

                // Make chart
                // ------------
                // Canvas
                svg = d3.select(element[0])
                    .append('svg')
                    .attr("width", w)
                    .attr("height", h)
                    .attr("width", w)
                    .attr("height", h)

                // ------------
                // Scale/domain calculators
                scale = {
                    // £
                    y: d3.scale.linear()
                        .domain([
                            0,
                            d3.max(dataRange, function(d) {
                                return d['verysmall']
                            })
                        ])
                        .range([100 - margin.bottom, margin.top])
                        .nice()

                    // Q1-4,year
                    ,
                    x: d3.time.scale()
                        .domain([
                            d3.min(dataRange, function(d) {
                                return QYtoDate(d)
                            }),
                            d3.max(dataRange, function(d) {
                                return QYtoDate(d)
                            })
                        ])
                        .range([margin.left, 100 - margin.right])
                        .nice(d3.time.year)
                }


                // ------------
                // Axes
                axes = svg.append("g")
                    .attr('id', 'axes')

                axes.append("g")
                    .attr('class', 'axis')
                    // axis points
                    .selectAll("text")
                    .data(scale.y.ticks())
                    .enter()
                    //
                    .append("text")
                    .text(function(d) {
                        return '£' + (d * 0.01).toFixed(2)
                    })
                    .attr("y", function(d, i) {
                        return scale.y(d) + "%"
                    })


                axes.append("svg")
                    .attr('class', 'axis')
                    .attr("y", "100%")
                    // axis points
                    .selectAll("text")
                    .data(scale.x.ticks())
                    .enter()
                    //
                    .append("text")
                    .text(function(d) {
                        return dateToY(d)
                    })
                    .attr("x", function(d, i) {
                        return scale.x(d) + "%"
                    })

                // ------------
                // Grids
                grids = svg.append("g")
                    .attr('id', 'grids')

                grids.append("g")
                    .selectAll("line")
                    .data(scale.y.ticks())
                    .enter()
                    //
                    .append("line")
                    .attr("y1", function(d, i) {
                        return scale.y(d) + "%"
                    })
                    .attr("y2", function(d, i) {
                        return scale.y(d) + "%"
                    })
                    .attr("x1", function(d, i) {
                        return margin.left + "%"
                    })
                    .attr("x2", function(d, i) {
                        return 100 - margin.right + "%"
                    })

                grids.append("g")
                    .selectAll("line")
                    .data(scale.x.ticks())
                    .enter()
                    //
                    .append("line")
                    .attr("x1", function(d, i) {
                        return scale.x(d) + "%"
                    })
                    .attr("x2", function(d, i) {
                        return scale.x(d) + "%"
                    })
                    .attr("y1", function(d, i) {
                        return margin.top + "%"
                    })
                    .attr("y2", function(d, i) {
                        return 100 - margin.bottom + "%"
                    })

                // Story groups
                stories = svg
                    .append("g")
                    .attr("class", "stories")

                currentAnnotation = svg.append("g")
                    .attr('id', 'currentAnnotation')

                // Group structure for data points
                _.each(scope.data.energy, function(dataset, energyType) {
                    var energy = svg
                        .append("g")
                        .attr("class", "energy " + energyType)

                    _.each(scatters, function(thisScatter) {
                        energy
                        // Circle
                            .append("g")
                            .attr("class", "plots " + thisScatter.class + " " + thisScatter.path)
                    })

                    _.each(lines, function(thisLine) {
                        /////////
                        // Lines
                        /////////
                        lineFunction[thisLine.path] = d3.svg.line()
                            .x(function(d, i) {
                                return scale.x(QYtoDate(d, i)) + lineOffset;
                            })
                            .y(function(d, i) {
                                return scale.y(d[thisLine.path]);
                            })
                            .interpolate("linear")

                        energy
                            .append("g")
                            .attr("class", "line " + thisLine.class + " " + thisLine.path)
                            .append("svg")
                            .attr("class", "pathContainer")
                            .attr("width", "100%")
                            .attr("height", "100%")
                            .attr("viewBox", "0 0 100 100")
                            .attr("preserveAspectRatio", "none")
                            .append("path")
                            .attr("class", "linePath")
                            .attr('vector-effect', "non-scaling-stroke")

                        var energyLineGroup = svg.select("." + energyType)
                        var energyLabel = energyLineGroup.select(".line." + thisLine.class + '.' + thisLine.path)
                        var indexObj = scope.data.energy[energyType][scope.index]

                        /////////
                        // Labels
                        /////////
                        energyLabel
                            .selectAll(".label")
                            .data(dataset.filter(function(d) {
                                return d.year === indexObj.year && d.quarter === indexObj.quarter;
                            }))
                            .enter()
                            .append("svg")
                            .attr("class", "label pointer-element")

                        energyLabel
                            .selectAll(".label")
                            .append("rect")
                            .attr("class", "box")
                            .attr("transform", "translate(-27,-9)")
                            .attr("width", "55")
                            .attr("height", "19")
                            .attr("rx", "3")
                            .attr("ry", "3")

                        energyLabel
                            .selectAll(".label")
                            .append("text")
                            .attr("class", "price")
                            .attr("transform", "translate(0,5)")
                            .attr("text-anchor", "middle")

                        var iconSize = 30
                        var energyW = iconSize
                        var energyH = energyW
                        var sizeH = iconSize
                        var sizeW = 60

                        energyLabel
                            .selectAll(".label")
                            .append("image")
                            .attr("class", "img-energy")
                            .attr("transform", "translate(" + (-(energyW / 2) + (-energyW * 1.5)) + "," + (-(energyH / 2)) + ")")
                            .attr("height", energyH)
                            .attr("width", energyW)
                            .attr("xlink:href", "build/img/energy-" + energyType + ".png")

                        energyLabel
                            .selectAll(".label")
                            .append("text")
                            .attr("class", "img-size label-explain")
                            .attr("transform", "translate(33,5)")
                            .text(thisLine.display)
                    })
                })

                scope.$watch("index", drawData, true);
                drawData();
            }

            function drawData() {
                var indexObj = dataRange[scope.index];
                var indexDate = QYtoDate(indexObj);

                //////////
                // Date
                //////////
                currentAnnotation
                    .selectAll(".currentDate")
                    .data(dataRange.filter(function(d) {
                        return typeof indexObj !== 'undefined' && typeof d !== 'undefined' && d.year === indexObj.year && d.quarter === indexObj.quarter;
                    }))
                    .enter()
                    .append("text")
                    .attr("class", "currentDate pointer-element")
                    .call(function() {
                        $compile(this[0].parentNode)(scope);
                    })

                currentAnnotation
                    .selectAll(".currentDate")
                    .transition().duration(transitionDuration).ease("linear")
                    .attr("text-anchor", "middle")
                    .attr("y", margin.top + 5 + "%")
                    .attr("x", function(d, i) {
                        return scale.x(QYtoDate(d)) + lineOffset + "%"
                    })
                    .text(function(d) {
                        return d.year + " Q" + d.quarter
                    })

                //////////
                // Tick line
                //////////
                currentAnnotation
                    .selectAll(".currentTick")
                    .data(dataRange.filter(function(d) {
                        return d.year === indexObj.year && d.quarter === indexObj.quarter;
                    }))
                    .enter()
                    .append("line")
                    .attr("class", "currentTick pointer-element")
                    .call(function() {
                        $compile(this[0].parentNode)(scope);
                    })

                currentAnnotation
                    .selectAll(".currentTick")
                    .transition().duration(transitionDuration).ease("linear")
                    .attr("x1", function(d, i) {
                        return scale.x(QYtoDate(d)) + lineOffset + "%"
                    })
                    .attr("x2", function(d, i) {
                        return scale.x(QYtoDate(d)) + lineOffset + "%"
                    })
                    .attr("y1", function(d, i) {
                        return margin.top + 6 + "%"
                    })
                    .attr("y2", function(d, i) {
                        return 100 - margin.bottom + "%"
                    })


                /// DATA
                _.each(scope.data.energy, function(dataset, energyType) {
                    //////////
                    // Stories
                    //////////

                    if (redraw()) {
                        stories
                            .selectAll("line")
                            .data(scope.data.stories)
                            .enter()
                            .append("line")
                            .call(function() {
                                $compile(this[0].parentNode)(scope);
                            })

                        stories
                            .selectAll("line")
                            .attr("x1", function(d, i) {
                                return scale.x(QYtoDate(d)) + lineOffset + "%"
                            })
                            .attr("x2", function(d, i) {
                                return scale.x(QYtoDate(d)) + lineOffset + "%"
                            })
                            .attr("y1", function(d, i) {
                                return margin.top + "%"
                            })
                            .attr("y2", function(d, i) {
                                return 100 - margin.bottom + "%"
                            })
                            .attr("stroke-width", quarterWidth + "%")
                            .attr("style", function(d, i) { return visibility(getTickIndex(d), scope.index) })
                    }

                    stories
                        .selectAll("line")
                        .attr("class", function(d, i) {
                            return "event-bar " + d.type
                        })
                        .transition()
                        .duration(transitionDuration / 2)
                        .attr("class", function(d, i) {
                            return "event-bar " + d.type + " " + (QYtoDate(d).valueOf() == indexDate.valueOf() ? ' highlighted' : null)
                        })
                        .delay(transitionDuration / 2)

                    //////////
                    // Plots
                    //////////

                    var energyPlotGroup = svg
                        .select("." + energyType)

                    _.each(scatters, function(thisScatter) {
                        reach(scope.index)
                        var energyPlot = energyPlotGroup.select(".plots." + thisScatter.class + '.' + thisScatter.path)

                        if (redraw()) {
                            energyPlot
                                .selectAll("circle")
                                .data(dataset)
                                .enter()
                                .append("circle")
                                .call(function() {
                                    $compile(this[0].parentNode)(scope);
                                });

                            energyPlot
                                .selectAll("circle")
                                .attr("cx", function(d, i) {
                                    return scale.x(QYtoDate(d)) + lineOffset + "%"
                                })
                                .attr("cy", function(d, i) {
                                    return (scale.y(d[thisScatter.path]) || 0) + "%"
                                })
                                .attr("r", function(d, i) {
                                    return (QYtoDate(d).valueOf() == indexDate.valueOf() ? pointSize * 1.5 : pointSize)
                                })
                                .attr("style", function(d, i) { return visibility(i-1, scope.index, false) })
                                .attr("class", function(d, i) {
                                    return (d[thisScatter.path] < 0.005 || typeof d[thisScatter.path] === 'undefined' ? 'baddata' : null)
                                })
                        } else {
                            energyPlot
                                .selectAll("circle")
                                .attr("r", function(d, i) {
                                    return (QYtoDate(d).valueOf() == indexDate.valueOf() ? pointSize * 1.5 : pointSize)
                                })
                        }
                    })

                    var energyLineGroup = svg
                        .select("." + energyType)

                    var labelElements = svg.select(".labels")
                        .append("rect")
                        .attr("class", "box")

                    _.each(lines, function(thisLine) {
                        reach(scope.index)
                        var energyLabel = energyLineGroup.select(".line." + thisLine.class + '.' + thisLine.path)
                        var energyPath = energyLineGroup.select(".line." + thisLine.class + '.' + thisLine.path + " .pathContainer")

                        //////////
                        // Lines
                        //////////
                        if (redraw()) {
                            var beforeData = dataset.filter(function(d) {
                                return QYtoDate(d) < QYtoDate(indexObj)
                            })

                            var afterData = dataset.filter(function(d) {
                                return QYtoDate(d) <= QYtoDate(indexObj)
                            })

                            energyPath
                                .selectAll(".linePath")
                                .transition().duration(transitionDuration).ease("linear")
                                .attr("d", lineFunction[thisLine.path](afterData))
                        }

                        //////////
                        // Labels
                        //////////
                        // Position
                        energyLabel
                            .selectAll(".label")
                            .data(dataset.filter(function(d) {
                                return d.year === indexObj.year && d.quarter === indexObj.quarter;
                            }))
                            .call(function() {
                                $compile(this[0].parentNode)(scope);
                            })

                        energyLabel
                            .selectAll(".label")
                            .transition().duration(transitionDuration).ease("linear")
                            .attr("x", function(d, i) {
                                return scale.x(QYtoDate(d)) + lineOffset + "%"
                            })
                            .attr("y", function(d, i) {
                                return scale.y(d[thisLine.path]) + "%"
                            })

                        // PRICE
                        energyLabel
                            .selectAll(".label .price")
                            .data(dataset.filter(function(d) {
                                return d.year === indexObj.year && d.quarter === indexObj.quarter;
                            }))
                            .call(function() {
                                $compile(this[0].parentNode)(scope);
                            })

                        energyLabel
                            .selectAll(".label .price")
                            .text(function(d) {
                                return (d[thisLine.path]).toFixed(3) + "p"
                            })
                    })
                })

                if(!checkRedraw()) {
                    svg.on("mousemove", function() {
                        onPoint(this,d3.mouse(this))
                    })
                }
            }
        }
    };
});
