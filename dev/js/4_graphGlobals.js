var rowsN
var reached = 1

var scatters = [
    { path: 'verysmall',       class: 'average_small', display:"V. small" },
    { path: 'small',           class: 'average_small', display:"Small" },
    { path: 'smallmedium',     class: 'average_small', display:"Small/med" },
    //
    { path: 'medium',          class: 'average_large', display:"Medium" },
    { path: 'large',           class: 'average_large', display:"Large" },
    { path: 'verylarge',       class: 'average_large', display:"V. large" },
    { path: 'extralarge',      class: 'average_large', display:"Extra large" }
]
var lines = [
    { path: 'average_small',   class: 'average_small', display:"Avg. small firm" },
    { path: 'average_large',   class: 'average_large', display:"Avg. large firm" }
]

function QYtoDate(d) {
    return typeof d !== 'undefined' ? new Date(d.year,(d.quarter*3)-3) : new Date()
}

function dateToQY(d) {
    var quarter = Math.ceil((d.getMonth()+1)/3)
    var year = d.getFullYear()
    return (quarter == 1 ? year+" " : "") + "Q"+quarter
}

function dateToY(d) {
    var year = d.getFullYear()+""
    return "'"+year.substring(2,4)
}

function dPrev(data,i) {
    return data[i-1 === -1 ? 0 : i-1]
}

function visibility(i,index) {
    hidden = index < i
    return hidden ? 'hidden' : 'visible'
}

function reach(index) {
    reached = reached < index+1 ? index+1 : reached
}

function redraw() {
    var totalrowsN = rowsN + ((scatters.length + lines.length) * 3)
    var check = reached-1 < totalrowsN
    if(reached >= rowsN && reached <= totalrowsN) {
        reached++
    }
    return check
}

angular.module('main').
   directive('graphChart', function ($compile) {
     return {
        replace: false,
        scope: {
            data: '=graphChart',
            go: '=',
            index: '='
        },
        link: function (scope, element, attrs) {
            var scale, axis, axes, grids, stories, svg, lineOffset, years, quarterWidth
            var margin = { top: 2.5, right: 2.5, bottom: 5, left: 5 }
            var w = "100%"
            var h = "100%"
            var pointSize = 2
            var canvasW = 100 - margin.left - margin.right
            // Set up data

            scope.$watch("go", function() {
                if(scope.go) {
                    buildChart();
                }
            }, true);

            function buildChart() {
                rowsN = scope.data.energy.electricity.length
                yars = _.uniq(_.map(scope.data.energy.electricity,'year'));
                quarters = ( yars.length * 4 ) - 1
                quarterWidth = ( canvasW / quarters )
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
                            d3.max(scope.data.energy.electricity, function(d) { return parseFloat(d['verysmall']) })
                        ])
                        .range([100-margin.bottom, margin.top])
                        .nice()

                    // Q1-4,year
                  , x: d3.time.scale()
                        .domain([
                            d3.min(scope.data.energy.electricity, function(d) { return QYtoDate(d) }),
                            d3.max(scope.data.energy.electricity, function(d) { return QYtoDate(d) })
                        ])
                        .range([margin.left, 100-margin.right])
                        .nice(d3.time.year)
                }


                // ------------
                // Axes
                axes = svg.append("g")
                    .attr('id','axes')

                axes.append("g")
                    .attr('class','axis')
                    // axis points
                    .selectAll("text")
                    .data(scale.y.ticks())
                    .enter()
                    //
                    .append("text")
                    .text(function(d) { return '£' + d.toFixed(2) })
                    .attr("y", function(d, i) { return scale.y(d) + "%" })


                axes.append("svg")
                    .attr('class','axis')
                    .attr("y", "100%")
                    // axis points
                    .selectAll("text")
                    .data(scale.x.ticks()) //dateToQY - 30
                    .enter()
                    //
                    .append("text")
                    .text(function(d) { return dateToY(d) })
                    .attr("x", function(d, i) {  return scale.x(d) + "%" })

                // ------------
                // Grids
                grids = svg.append("g")
                    .attr('id','grids')

                grids.append("g")
                    .selectAll("line")
                    .data(scale.y.ticks()) //dateToQY - 30
                    .enter()
                    //
                    .append("line")
                    .attr("y1", function(d, i) { return scale.y(d) + "%" })
                    .attr("y2", function(d, i) { return scale.y(d) + "%" })
                    .attr("x1", function(d, i) { return margin.left + "%" })
                    .attr("x2", function(d, i) { return 100-margin.right + "%" })

                grids.append("g")
                    .selectAll("line")
                    .data(scale.x.ticks()) //dateToQY - 30
                    .enter()
                    //
                    .append("line")
                    .attr("x1", function(d, i) { return scale.x(d) + "%" })
                    .attr("x2", function(d, i) { return scale.x(d) + "%" })
                    .attr("y1", function(d, i) { return margin.top + "%" })
                    .attr("y2", function(d, i) { return 100-margin.bottom + "%" })

                // Story groups
                stories = svg
                        .append("g")
                        .attr("class","stories")

                currentAnnotation = svg.append("g")
                    .attr('id','currentAnnotation')

                // Group structure for data points
                _.each(scope.data.energy, function(energy,energyName) {
                    var energy = svg
                        .append("g")
                        .attr("class","energy "+energyName)

                    _.each(scatters, function(thisScatter) {
                        energy
                            // Circle
                            .append("g")
                            .attr("class","plots "+thisScatter.class+" "+thisScatter.path)
                    })

                    _.each(lines, function(thisLine) {
                        energy
                            .append("g")
                            .attr("class","line "+thisLine.class+" "+thisLine.path)
                    })
                })

                scope.$watch("index", drawData, true);
                drawData();
            }

            function drawData() {
                var indexObj = scope.data.energy.electricity[scope.index];
                var indexDate = QYtoDate(indexObj);

                //////////
                // Date
                //////////
                currentAnnotation
                    .selectAll(".currentDate")
                    .data(scope.data.energy.electricity.filter(function(d) {
                        return typeof indexObj !== 'undefined'
                            && typeof d !== 'undefined'
                            && d.year === indexObj.year
                            && d.quarter === indexObj.quarter;
                    }))
                    .enter()
                    .append("text")
                    .attr("class","currentDate")
                    .call(function(){
                        $compile(this[0].parentNode)(scope);
                    })

                currentAnnotation
                    .selectAll(".currentDate")
                    .attr("text-anchor","middle")
                    .attr("y", margin.top+5+"%")
                    .attr("x", function(d, i) { return scale.x(QYtoDate(d)) + lineOffset + "%" })
                    .text(function(d) {
                        return d.year + " Q" + d.quarter
                    })

                //////////
                // Tick line
                //////////
                currentAnnotation
                    .selectAll(".currentTick")
                    .data(scope.data.energy.electricity.filter(function(d) {
                        return d.year === indexObj.year
                            && d.quarter === indexObj.quarter;
                    }))
                    .enter()
                    .append("line")
                    .attr("class","currentTick")
                    .call(function(){
                        $compile(this[0].parentNode)(scope);
                    })

                currentAnnotation
                    .selectAll(".currentTick")
                    .attr("x1", function(d, i) { return scale.x(QYtoDate(d)) + lineOffset + "%" })
                    .attr("x2", function(d, i) { return scale.x(QYtoDate(d)) + lineOffset + "%" })
                    .attr("y1", function(d, i) { return margin.top+6+"%" })
                    .attr("y2", function(d, i) { return 100-margin.bottom + "%" })

                /// DATA
                _.each(scope.data.energy, function(dataset,energyType) {
                    //////////
                    // Stories
                    //////////

                    if(redraw()) {
                        stories
                            .selectAll("line")
                            .data(scope.data.stories)
                            .enter()
                            .append("line")
                            .on("click", function(d,i){
                                setIndex(scope.data.energy.electricity,d)
                            })
                            .call(function(){
                                $compile(this[0].parentNode)(scope);
                            });

                        stories
                            .selectAll("line")
                            .attr("x1", function(d, i) { return scale.x(QYtoDate(d)) + lineOffset + "%" })
                            .attr("x2", function(d, i) { return scale.x(QYtoDate(d)) + lineOffset + "%" })
                            .attr("y1", function(d, i) { return margin.top + "%" })
                            .attr("y2", function(d, i) { return 100-margin.bottom + "%" })
                            .attr("stroke-width", quarterWidth+"%")
                            .attr("visibility", function(d, i) {
                                var isValidYear = _.any(yars,function(x) { return x === d.year })
                                return (QYtoDate(d) <= indexDate || !redraw()) && isValidYear ? 'visible' : 'hidden'
                            })
                            .attr("class", function(d, i) {
                                return "event-bar "+d.type+" "+(QYtoDate(d).valueOf() == indexDate.valueOf() ? ' highlighted' : null)
                            })
                    } else {
                        stories
                            .selectAll("line")
                            .attr("class", function(d, i) {
                                return "event-bar "+d.type+" "+(QYtoDate(d).valueOf() == indexDate.valueOf() ? ' highlighted' : null)
                            })
                    }

                    //////////
                    // Plots
                    //////////

                    var energyPlotGroup = svg
                        .select("."+energyType)

                    _.each(scatters, function(thisScatter) {
                        reach(scope.index)
                        var energyPlot = energyPlotGroup.select(".plots."+thisScatter.class+'.'+thisScatter.path)

                        if(redraw()) {
                            energyPlot
                                .selectAll("circle")
                                .data(dataset)
                                .enter()
                                .append("circle")
                                .call(function(){
                                    $compile(this[0].parentNode)(scope);
                                });

                            energyPlot
                                .selectAll("circle")
                                .attr("r", function(d, i) {
                                    return (QYtoDate(d).valueOf() == indexDate.valueOf() ? pointSize * 1.5 : pointSize)
                                })
                                .attr("cx", function(d, i) { // Time
                                    return scale.x(QYtoDate(d)) + lineOffset + "%"
                                })
                                .attr("cy", function(d, i) { // Money
                                    var cy = scale.y(d[thisScatter.path]) || 0
                                    return cy + "%"
                                })
                                .attr("visibility", function(d, i) {
                                    return visibility(i,scope.index)
                                })
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
                        .select("."+energyType)

                    var labelElements = svg.select(".labels")

                    _.each(lines, function(thisLine) {
                        reach(scope.index)
                        var energyLine = energyLineGroup.select(".line."+thisLine.class+'.'+thisLine.path)

                        //////////
                        // Lines
                        //////////
                        if(redraw()) {
                            energyLine
                                .selectAll("line")
                                .data(dataset)
                                .enter()
                                .append("line")
                                .call(function(){
                                    $compile(this[0].parentNode)(scope);
                                });

                            energyLine
                                .selectAll("line")
                                .attr("x1", function(d, i) {
                                    return scale.x(QYtoDate(dPrev(dataset,i))) + lineOffset + "%"
                                })
                                .attr("y1", function(d, i) {
                                    return scale.y(dPrev(dataset,i)[thisLine.path]) + "%"
                                })
                                .attr("x2", function(d, i) { // Time
                                    return scale.x(QYtoDate(d)) + lineOffset + "%"
                                })
                                .attr("y2", function(d, i) { // Money
                                    return scale.y(d[thisLine.path]) + "%"
                                })
                                .attr("visibility", function(d, i) {
                                    return visibility(i,scope.index)
                                })
                        }

                        //////////
                        // Labels
                        //////////
                        var label = energyLine
                            .selectAll(".label")
                            .data(dataset.filter(function(d) {
                                return d.year === indexObj.year
                                    && d.quarter === indexObj.quarter;
                            }))
                            .enter()
                            .append("g")
                            .attr("class","label")
                            .on("mouseover", function(){
                                d3.selectAll(".annotation").style("visibility", "visible")
                            })
                            .on("mouseout", function(){
                                d3.selectAll(".annotation").style("visibility", "hidden")
                            })
                            .call(function(){
                                $compile(this[0].parentNode)(scope);
                            });

                        energyLine
                            .selectAll(".label *")
                            .remove();

                        energyLine
                            .selectAll(".label")
                            .append("rect")
                            .attr("class","box")
                            .attr("x", function(d, i) {
                                return scale.x(QYtoDate(d)) + lineOffset + "%"
                            })
                            .attr("y", function(d, i) {
                                return scale.y(parseFloat(d[thisLine.path])) + "%"
                            })
                            .attr("width", "55")
                            .attr("height", "19")
                            .attr("rx","3")
                            .attr("ry","3")
                            .attr("transform","translate(-27,-9)")

                        energyLine
                            .selectAll(".label")
                            .append("text")
                            .attr("class","price")
                            .attr("text-anchor", "middle")
                            .attr("x", function(d, i) {
                                return scale.x(QYtoDate(d)) + lineOffset + "%"
                            })
                            .attr("y", function(d, i) {
                                return scale.y(parseFloat(d[thisLine.path])) + "%"
                            })
                            .attr("transform","translate(0,5)")
                            .text(function(d) {
                                return ( d[thisLine.path] * 100 ).toFixed(3) + "p"
                            })

                        var iconSize = 25

                        var energyW = iconSize
                        var energyH = energyW
                        // Energy
                        energyLine
                            .selectAll(".label")
                            .append("image")
                            .attr("x", function(d, i) { return scale.x(QYtoDate(d)) + lineOffset + "%" })
                            .attr("y", function(d, i) { return scale.y(parseFloat(d[thisLine.path])) + "%" })
                            .attr("transform", "translate("+( -(energyW/2) + (-energyW * 1.5) )+","+( -(energyH/2) )+")")
                            .attr("height", energyH)
                            .attr("width", energyW)
                            .attr("xlink:href", "build/img/energy-"+energyType+".png")

                        var sizeH = iconSize
                        var sizeW = 60
                        // Size
                        energyLine
                            .selectAll(".label")
                            .append("image")
                            .attr("x", function(d, i) { return scale.x(QYtoDate(d)) + lineOffset + "%" })
                            .attr("y", function(d, i) { return scale.y(parseFloat(d[thisLine.path])) + "%" })
                            .attr("transform", "translate("+( -(sizeW/1.4) + (sizeW) )+","+( -(sizeH/2) )+")")
                            .attr("height", sizeH)
                            .attr("width", sizeW)
                            .attr("xlink:href", "build/img/business-"+thisLine.class+".png")
                    })
                })
            }
         }
      };
   });