function drawData(dataset) {
    // ------------
    // Plot lines
    d3.select("#data")
       .selectAll("*").remove()

    // Group by lineset
    var colors = {
        pink: '#E9168C',
        green: '#C1D540'
    }

    var lines = [
        { path: '.average["average_small"]', color: colors.pink },
        //
        { path: '.average["average_large"]', color: colors.green }
    ]

    var scatters = [
        { path: '.raw.group_small.["very small"]', color: colors.pink },
        { path: '.raw.group_small.["small"]', color: colors.pink },
        { path: '.raw.group_small.["small/medium"]', color: colors.pink },
        //
        { path: '.raw.group_large["medium"]', color: colors.green },
        { path: '.raw.group_large["large"]', color: colors.green },
        { path: '.raw.group_large["very large"]', color: colors.green },
        { path: '.raw.group_large["extra large"]', color: colors.green }
    ]

    var plots = svg.select('#data')
        .append("g")
        .attr("class","scatter")

    _.each(scatters, function(thisScatter) {
        // SCATTER
        plots
            // Circle
            .append("g")
            .attr("class","plots")
            .selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("fill",thisScatter.color)
            .attr("r", pointSize)
            .attr("cx", function(d, i) { // Time
                return scale.x(QYtoDate(d)) + pointSize + "%"
            })
            .attr("cy", function(d, i) { // Money
                return scale.y(_.get(d,thisScatter.path)) + "%"
            })
            .attr("visibility", function(d, i) {
                return (_.get(d,thisScatter.path) == null ? 'hidden' : 'visible')
            })
    })

    var lineG = svg.select('#data')
        .append("g")
        .attr("class","lineGroup")

    _.each(lines, function(thisLine) {
        // LINES
        var line = d3.svg.line()
            .x(function(d){ return scale.x(QYtoDate(d)) + pointSize + "%" })
            .y(function(d){ return scale.y(_.get(d,thisLine.path)) })
            .interpolate("linear");

        function dPrev(d,i) {
            return d[i-1 === -1 ? 0 : i-1]
        }

        lineG
            .append("g")
            .attr("class","line")
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
            //
            .attr("stroke",thisLine.color)
            .style("stroke-width", 2)
            .style("fill", "none")
    })
}