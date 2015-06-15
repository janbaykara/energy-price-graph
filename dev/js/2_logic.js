angular.module('main', ['ngRetina'])
    .controller('main', function($scope) {
        var dataset = data.electricity
        var pad = 50
        var w = 1000
        var h = 500
        var pointSize = 2

        // ------------
        // Canvas
        var svg = d3.select("#graph")
            .append('svg')
            .attr("width", w+pad*2)
            .attr("height", h+pad*2)

        // ------------
        // Scale/domain calculators
        function datumToDate(d) {
            return new Date(d.year,(d.quarter*3)-3)
        }

        var scale = {
            // £
            y: d3.scale.linear()
                .domain([
                    0,
                    d3.max(dataset, function(d) {
                        return d['very small'];
                    })
                ])
                .range([h-pad, pad])
                .nice()

            // Q1-4,year
          , x: d3.time.scale()
                .domain([
                    d3.min(dataset, function(d) {
                        return datumToDate(d)
                    }),
                    d3.max(dataset, function(d) {
                        return datumToDate(d)
                    })
                ])
                .range([pad, w-pad])
                .nice()
        }


        // ------------
        // Plot lines
        var lines = [
            ['average','black'],
            ['average_small','green'],
            ['average_large','red']
        ]
        _.each(lines, function(line_set) {
            svg // Group by lineset
                .append("g")
                .attr("class","line")
                .attr("id","line-"+line_set[0])
                // Plot
                .selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("fill",line_set[1])
                .attr("r", pointSize)
                .attr("cx", function(d, i) { // Time
                    return scale.x(datumToDate(d)) + pointSize;
                })
                .attr("cy", function(d, i) { // Money
                    return scale.y(d[line_set[0]])
                })
        })


        // ------------
        // Axes
        var axis = {
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
    })