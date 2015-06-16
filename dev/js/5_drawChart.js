function drawChart() {
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
}