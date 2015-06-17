function QYtoDate(d) {
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

angular.module('main').
   directive('graphChart', function ($parse) {
     return {
        replace: false,
        scope: {
            data: '='
        },
        link: function ($scope, element, attrs) {
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

            _.each(data.energy, function(energy,energyName) {
                drawData(energy,energyName)
            })

            // Draw data
            function drawData(dataset,energyType,then) {
                                    // ------------
                                    // Clear
                                    // d3.select("#data")
                                    //    .selectAll("*").remove()

                                    // Group by lineset
                                    var energy = svg.select('#data')
                                        .append("g")
                                        .attr("class",energyType)

                                    //////////
                                    // Scatter
                                    //////////

                                    var scatters = [
                                        { path: '.raw.group_small.["very small"]', class: 'average_small' },
                                        { path: '.raw.group_small.["small"]', class: 'average_small' },
                                        { path: '.raw.group_small.["small/medium"]', class: 'average_small' },
                                        //
                                        { path: '.raw.group_large["medium"]', class: 'average_large' },
                                        { path: '.raw.group_large["large"]', class: 'average_large' },
                                        { path: '.raw.group_large["very large"]', class: 'average_large' },
                                        { path: '.raw.group_large["extra large"]', class: 'average_large' }
                                    ]

                                    var plots = energy
                                        .append("g")
                                        .attr("class","scatter")

                                    _.each(scatters, function(thisScatter) {
                                        plots
                                            // Circle
                                            .append("g")
                                            .attr("class","plots "+thisScatter.class)
                                            .selectAll("circle")
                                            .data(dataset)
                                            .enter()
                                            .append("circle")
                                            .attr("r", pointSize)
                                            .attr("cx", function(d, i) { // Time
                                                return scale.x(QYtoDate(d)) + pointSize + "%"
                                            })
                                            .attr("cy", function(d, i) { // Money
                                                var cy = scale.y(_.get(d,thisScatter.path))
                                                return (isNaN(cy) ? 0 : cy)  + "%"
                                            })
                                            .attr("visibility", function(d, i) {
                                                return (_.get(d,thisScatter.path) == null ? 'hidden' : 'visible')
                                            })
                                            .attr("ng-attr-unrevealed", function(d, i) { // Money
                                                return reveal(i)
                                            })
                                    })



                                    //////////
                                    // Lines
                                    //////////

                                    var lines = [
                                        { path: '.average["average_small"]', class: 'average_small' },
                                        //
                                        { path: '.average["average_large"]', class: 'average_large' }
                                    ]

                                    var lineG = energy
                                        .append("g")
                                        .attr("class","lineGroup")

                                    _.each(lines, function(thisLine) {
                                        var line = d3.svg.line()
                                            .x(function(d){ return scale.x(QYtoDate(d)) + pointSize + "%" })
                                            .y(function(d){ return scale.y(_.get(d,thisLine.path)) })
                                            .interpolate("linear");

                                        function dPrev(d,i) {
                                            return d[i-1 === -1 ? 0 : i-1]
                                        }

                                        lineG
                                            .append("g")
                                            .attr("class","line "+thisLine.class)
                                            .selectAll("line")
                                            .data(dataset)
                                            .enter()
                                            .append("line")          // attach a line
                                        // [dataset[i-1 === -1 ? 0 : i-1]
                                            .attr("x1", function(d, i) {
                                                return scale.x(QYtoDate(dPrev(dataset,i))) + pointSize + "%"
                                            })     // x1 position of the first end of the line
                                            .attr("y1", function(d, i) {
                                                return scale.y(_.get(dPrev(dataset,i),thisLine.path)) + "%"
                                            })      // y1 position of the first end of the line
                                        // d
                                            .attr("x2", function(d, i) { // Time
                                                return scale.x(QYtoDate(d)) + pointSize + "%"
                                            })     // x2 position of the second end of the line
                                            .attr("y2", function(d, i) { // Money
                                                return scale.y(_.get(d,thisLine.path)) + "%"
                                            })    // y2 position of the second end of the line
                                               // x2 position of the second end of the line
                                            .attr("ng-attr-unrevealed", function(d, i) { // Money
                                                return reveal(i)
                                            })
                                        })
                                }

         }
      };
   });