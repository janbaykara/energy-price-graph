function QYtoDate(D) {
    var d = D || data.energy.electricity[data.energy.electricity.length-1]
    return new Date(d.date.year,(d.date.quarter*3)-3)
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

function dPrev(d,i) {
    return d[i-1 === -1 ? 0 : i-1]
}

function visibility(i,index) {
    return index < i ? 'hidden' : 'visibility'
}

angular.module('main').
   directive('graphChart', function ($compile) {
     return {
        replace: false,
        scope: {
            data: '=',
            index: '='
        },
        link: function (scope, element, attrs) {
            var py = 5
            var px = 5
            var w = "100%"
            var h = "100%"
            var pointSize = 2
            var scale, axis

            var svg = d3.select(element[0])
                        .append('svg')
                        .attr("width", w)
                        .attr("height", h)

            // Make chart
                                    // ------------
                                    // Canvas
                                    svg
                                        .attr("width", w)
                                        .attr("height", h)

                                    // ------------
                                    // Scale/domain calculators
                                    scale = {
                                        // £
                                        y: d3.scale.linear()
                                            .domain([
                                                0,
                                                d3.max(data.energy.electricity, function(d) {
                                                    return d.raw.group_small['very small']
                                                })
                                            ])
                                            .range([100-py, py])
                                            .nice()

                                        // Q1-4,year
                                      , x: d3.time.scale()
                                            .domain([
                                                d3.min(data.energy.electricity, function(d) {
                                                    return QYtoDate(d)
                                                }),
                                                d3.max(data.energy.electricity, function(d) {
                                                    return QYtoDate(d)
                                                })
                                            ])
                                            .range([px, 100-px])
                                            .nice()
                                    }


                                    // ------------
                                    // Axes
                                    var axes = svg.append("g")
                                        .attr('id','axes')

                                    axes.append("g")
                                        .attr('class','axis')
                                        .attr('id','axis-y')
                                        .attr("transform", "translate(0,0)")
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
                                        .attr('id','axis-y')
                                        .attr("y", "100%")
                                        // axis points
                                        .selectAll("text")
                                        .data(scale.x.ticks(20)) //dateToQY - 30
                                        .enter()
                                        //
                                        .append("text")
                                        .text(function(d) { return dateToY(d) })
                                        .attr("x", function(d, i) {  return scale.x(d) + "%" })

                                    // ------------
                                    // Grids
                                    var grids = svg.append("g")
                                        .attr('id','grids')

                                    grids.append("svg")
                                        .selectAll("line")
                                        .data(scale.y.ticks()) //dateToQY - 30
                                        .enter()
                                        //
                                        .append("line")
                                        .attr("y1", function(d, i) { return scale.y(d) + "%" })
                                        .attr("y2", function(d, i) { return scale.y(d) + "%" })
                                        .attr("x1", function(d, i) { return 100-px + "%" })
                                        .attr("x2", function(d, i) { return px + "%" })

                                    grids.append("svg")
                                        .selectAll("line")
                                        .data(scale.x.ticks(20)) //dateToQY - 30
                                        .enter()
                                        //
                                        .append("line")
                                        .attr("x1", function(d, i) { return scale.x(d) + "%" })
                                        .attr("x2", function(d, i) { return scale.x(d) + "%" })
                                        .attr("y1", function(d, i) { return 100-py + "%" })
                                        .attr("y2", function(d, i) { return py + "%" })

                                    svg.append("g")
                                        .attr('id','data')

            // Set up data
            var scatters = [
                { path: '.raw.group_small.["very small"]',      class: 'average_small' },
                { path: '.raw.group_small.["small"]',           class: 'average_small' },
                { path: '.raw.group_small.["small/medium"]',    class: 'average_small' },
                //
                { path: '.raw.group_large["medium"]',           class: 'average_large' },
                { path: '.raw.group_large["large"]',            class: 'average_large' },
                { path: '.raw.group_large["very large"]',       class: 'average_large' },
                { path: '.raw.group_large["extra large"]',      class: 'average_large' }
            ]

            var lines = [
                { path: '.average["average_small"]', class: 'average_small' },
                //
                { path: '.average["average_large"]', class: 'average_large' }
            ]

            _.each(data.energy, function(energy,energyName) {
                var energy = svg.select('#data')
                    .append("g")
                    .attr("class","energy "+energyName)

                var plots = energy
                    .append("g")
                    .attr("class","scatter")

                var lineG = energy
                    .append("g")
                    .attr("class","lineGroup")

                _.each(scatters, function(thisScatter) {
                    plots
                        // Circle
                        .append("g")
                        .attr("class","plots "+thisScatter.class)
                        .attr("path",thisScatter.path)
                })

                _.each(lines, function(thisLine) {
                    lineG
                        .append("g")
                        .attr("class","line "+thisLine.class)
                        .attr("path",thisLine.path)
                })

            })

            scope.$watch("index", orchestrateData, true);

            function orchestrateData() {
                _.each(data.energy, function(energy,energyName) {
                    drawData(energy,energyName)
                })
            }

            // Draw data
            function drawData(dataset,energyType,then) {
                //////////
                // Plots
                //////////

                var energyPlotGroup = svg.select("#data")
                    .select("."+energyType)
                    .select(".scatter")

                _.each(scatters, function(thisScatter) {
                    var energyPlot = energyPlotGroup.select("."+thisScatter.class+'[path=\''+thisScatter.path+'\']')

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
                        .attr("r", pointSize)
                        .attr("cx", function(d, i) { // Time
                            return scale.x(QYtoDate(d)) + pointSize + "%"
                        })
                        .attr("cy", function(d, i) { // Money
                            var cy = scale.y(_.get(d,thisScatter.path))
                            return (isNaN(cy) ? 0 : cy)  + "%"
                        })
                        .attr("visibility", function(d, i) {
                            return visibility(i,scope.index)
                        })
                        .attr("class", function(d, i) {
                            return (_.get(d,thisScatter.path) == null ? 'baddata' : '')
                        })
                })

                //////////
                // Lines
                //////////

                var energyLineGroup = svg.select("#data")
                    .select("."+energyType)
                    .select(".lineGroup")

                _.each(lines, function(thisLine) {
                    var energyLine = energyLineGroup.select("."+thisLine.class+'[path=\''+thisLine.path+'\']')

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
                            return scale.x(QYtoDate(dPrev(dataset,i))) + pointSize + "%"
                        })
                        .attr("y1", function(d, i) {
                            return scale.y(_.get(dPrev(dataset,i),thisLine.path)) + "%"
                        })
                        .attr("x2", function(d, i) { // Time
                            return scale.x(QYtoDate(d)) + pointSize + "%"
                        })
                        .attr("y2", function(d, i) { // Money
                            return scale.y(_.get(d,thisLine.path)) + "%"
                        })
                        .attr("visibility", function(d, i) {
                            return visibility(i,scope.index)
                        })
                })
            }
         }
      };
   });