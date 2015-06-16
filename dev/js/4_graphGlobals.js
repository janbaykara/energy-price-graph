var svg
var py = 5
var px = 5
var w = "100%"
var h = "100%"
var pointSize = 2
var scale, axis

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