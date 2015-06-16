angular.module('main', ['ngRetina'])
    .controller('main', function($scope) {
        $scope.energy = data.energy
        $scope.energySelector = data.energy.gas

        var svg
        var py = 5
        var px = 5
        var w = "100%"
        var h = "100%"
        var pointSize = 2
        var scale, axis

        function QYtoDate(d) {
            return new Date(d.year,(d.quarter*3)-3)
        }

        function dateToQY(d) {
            var quarter = Math.ceil((d.getMonth()+1)/3)
            var year = d.getFullYear()
            return (quarter == 1 ? year+" " : "") + "Q"+quarter
        }

        function dateToY(d) {
            var year = d.getFullYear()
            return year
        }

        $scope.drawChart = function() {
            // ------------
            // Canvas
            svg = d3.select("#graph")
                .append('svg')
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
                            return d['very small'];
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
                .text(function(d) {
                    return '£' + d.toFixed(2)
                })
                .attr("y", function(d, i) {
                    return scale.y(d) + "%"
                })


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
                .text(function(d) {
                    return dateToY(d)
                })
                .attr("x", function(d, i) {
                    return scale.x(d) + "%"
                })

            svg.append("g")
                .attr('id','data')
        }

        $scope.drawChart();

        $scope.drawData = function() {
            var dataset = $scope.energySelector

            // ------------
            // Plot lines
            d3.select("#data")
               .selectAll("*").remove()

            // Group by lineset
            var lines = [
                // ['average', 'black'],
                ['average_small','#E9168C'],
                ['average_large','#C1D540']
            ]
            _.each(lines, function(line_set) {

                var plots = svg.select('#data')
                    .append("g")
                    .attr("class","scatter")
                    .attr("id","line-"+line_set[0])

                // LINES
                var line = d3.svg.line()
                    .x(function(d){ return scale.x(QYtoDate(d)) + pointSize + "%" })
                    .y(function(d){ return scale.y(d[line_set[0]]) })
                    .interpolate("linear");

                plots
                    .append("g")
                    .attr("class","lines")
                    .selectAll("line")
                    .data(dataset)
                    .enter()
                    .append("line")          // attach a line
                // [dataset[i-1 === -1 ? 0 : i-1]
                    .attr("x1", function(d, i) {
                        return scale.x(QYtoDate(dataset[i-1 === -1 ? 0 : i-1])) + pointSize + "%"
                    })     // x1 position of the first end of the line
                    .attr("y1", function(d, i) {
                        return scale.y(dataset[i-1 === -1 ? 0 : i-1][line_set[0]]) + "%"
                    })      // y1 position of the first end of the line
                // d
                    .attr("x2", function(d, i) { // Time
                        return scale.x(QYtoDate(d)) + pointSize + "%"
                    })     // x2 position of the second end of the line
                    .attr("y2", function(d, i) { // Money
                        return scale.y(d[line_set[0]]) + "%"
                    })    // y2 position of the second end of the line
                    //
                    .attr("stroke",line_set[1])
                    .style("stroke-width", 2)
                    .style("fill", "none")

                // SCATTER
                plots
                    // Circle
                    .append("g")
                    .attr("class","plots")
                    .selectAll("circle")
                    .data(dataset)
                    .enter()
                    .append("circle")
                    .attr("fill",line_set[1])
                    .attr("r", pointSize)
                    .attr("cx", function(d, i) { // Time
                        return scale.x(QYtoDate(d)) + pointSize + "%"
                    })
                    .attr("cy", function(d, i) { // Money
                        return scale.y(d[line_set[0]]) + "%"
                    })
            })
        }
    })