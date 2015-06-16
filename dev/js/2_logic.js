angular.module('main', ['ngRetina'])
    .controller('main', function($scope) {
        $scope.energy = data.energy
        $scope.energySelector = data.energy.gas

        var svg
        var pad = 50
        var w = 1000
        var h = 500
        var pointSize = 2
        var scale, axis

        function QYtoMY(d) {
            return new Date(d.year,(d.quarter*3)-3)
        }

        $scope.drawChart = function() {
            // ------------
            // Canvas
            svg = d3.select("#graph")
                .append('svg')
                .attr("width", w+pad*2)
                .attr("height", h+pad*2)

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
                    .range([h-pad, pad])
                    .nice()

                // Q1-4,year
              , x: d3.time.scale()
                    .domain([
                        d3.min(data.energy.electricity, function(d) {
                            return QYtoMY(d)
                        }),
                        d3.max(data.energy.electricity, function(d) {
                            return QYtoMY(d)
                        })
                    ])
                    .range([pad, w-pad])
                    .nice()
            }


            // ------------
            // Axes
            axis = {
                x: d3.svg.axis()
                    .scale(scale.x)
                    .orient("bottom")
                    .tickSize(10)

              , y: d3.svg.axis()
                    .scale(scale.y)
                    .orient("left")
                    // .ticks(10)
                    .tickFormat(function(d) {
                        return '£' + d.toFixed(2)
                    })
            }

            svg.append("g")
                .attr('class','axis')
                .attr('id','axis-x')
                .attr("transform", "translate(0,"+(h-pad)+")")
                .call(axis.x)

            svg.append("g")
                .attr('class','axis')
                .attr('id','axis-y')
                .attr("transform", "translate("+pad+",0)")
                .call(axis.y)

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
                    .x(function(d){ return scale.x(QYtoMY(d)) + pointSize })
                    .y(function(d){ return scale.y(d[line_set[0]]) })
                    .interpolate("linear");

                plots
                    .append("g")
                    .attr("class","lines")
                    .selectAll("path")
                    .data(dataset)
                    .enter()
                    .append("path")
                    .attr("d", function(d,i) { return line([dataset[i-1 === -1 ? 0 : i-1],d]) })
                    .style("stroke-width", 2)
                    .style("fill", "none")
                    .attr("stroke",line_set[1])

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
                        return scale.x(QYtoMY(d)) + pointSize;
                    })
                    .attr("cy", function(d, i) { // Money
                        return scale.y(d[line_set[0]])
                    })
            })
        }
    })