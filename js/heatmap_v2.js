// INPUT TO HEATMAPCHART
var countries = ['USA'];
var file_csv="/datafiles/heatmapfinalv2.csv";
var dates =[1962,2014];




var margin = { top: 50, right: 0, bottom: 100, left: 30 },
width = 750 - margin.left - margin.right,
height = 370 - margin.top - margin.bottom,
gridSize = Math.floor(width / 24),
legendElementWidth = gridSize*2,
buckets = 9,
colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];
var svg = d3.select("#heatmap").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var dayLabels = svg.selectAll(".dayLabel")
.data(days)
.enter().append("text")
.text(function (d) { return d; })
.attr("x", 0)
.attr("y", function (d, i) { return i * gridSize; })
.style("text-anchor", "end")
.attr("transform", "translate(-6," + gridSize / 1.5 + ")")
.attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });
var timeLabels = svg.selectAll(".timeLabel")
.data(times)
.enter().append("text")
.text(function(d) { return d; })
.attr("x", function(d, i) { return i * gridSize; })
.attr("y", 0)
.style("text-anchor", "middle")
.attr("transform", "translate(" + gridSize / 2 + ", -6)")
.attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });
var heatmapChart = function(data,country,year){
    d3.csv(data, function(data) {
        //if(error) throw error;
        return{
            country : data.country,
            year : +data.year,
            day : +data.day,
            hour : +data.hour,
            value : +data.value
        };
    }//, function(data) {
        //        console.log(data);
        // }
        ,function(error, data) {
            var filteredData = data.filter(function(d)
            {

                if(( country.includes(d["country"])) && (d["year"] >= year[0]) && (d["year"] <= year[1]))
                {
                    return d;
                }

            })

            ////////DATAGROUPER DECLARATION - BEGIN
            var DataGrouper = (function() {
                var has = function(obj, target) {
                    return _.any(obj, function(value) {
                        return _.isEqual(value, target);
                    });
                };

                var keys = function(data, names) {
                    return _.reduce(data, function(memo, item) {
                        var key = _.pick(item, names);
                        if (!has(memo, key)) {
                            memo.push(key);
                        }
                        return memo;
                    }, []);
                };

                var group = function(data, names) {
                    var stems = keys(data, names);
                    return _.map(stems, function(stem) {
                        return {
                            key: stem,
                            vals:_.map(_.where(data, stem), function(item) {
                                return _.omit(item, names);
                            })
                        };
                    });
                };

                group.register = function(name, converter) {
                    return group[name] = function(data, names) {
                        return _.map(group(data, names), converter);
                    };
                };

                return group;
            }());
            DataGrouper.register("sum", function(item) {
                return _.extend({}, item.key, {value: _.reduce(item.vals, function(memo, node) {
                    return memo + Number(node.value);
                }, 0)});
            });
            ////////DATAGROUPER DECLARATION - END
            filteredData = DataGrouper.sum(filteredData,["day", "hour"]);


            var colorScale = d3.scaleQuantile()
            .domain([0, buckets - 1, d3.max(filteredData, function (d) { return d.value; })])
            .range(colors);
            var cards = svg.selectAll(".hour")
            .data(filteredData, function(d) {return d.day+':'+d.hour;});
            cards.append("title");
            cards.enter().append("rect")
            .attr("x", function(d) { return (d.hour-1) * gridSize; })
            .attr("y", function(d) { return (d.day - 1) * gridSize; })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", colors[0]);
            cards.transition().duration(750).style("fill", function(d) { return colorScale(d.value); });
            cards.select("title").text(function(d) { return d.value; });

            cards.exit().remove();
            //$(".legend").empty();

            var legend = svg.selectAll(".legend")
            .data([0].concat(colorScale.quantiles()), function(d) { return d; });
            legend.enter().append("g")
            .attr("class", "legend");
            legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", function(d, i) { return colors[i]; });
            legend.append("text")
            .attr("class", "mono")
            .text(function(d) { return "≥ " + Math.round(d); })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height + gridSize);
        }
    );}
    // },function(error, data) {
    //   var colorScale = d3.scale.quantile()
    //                   .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
    //                   .range(colors);
    //   var cards = svg.selectAll(".hour")
    //               .data(data, function(d) {return d.day+':'+d.hour;});
    //   cards.append("title");
    //   cards.enter().append("rect")
    //               .attr("x", function(d) { return (d.hour - 1) * gridSize; })
    //               .attr("y", function(d) { return (d.day - 1) * gridSize; })
    //               .attr("rx", 4)
    //               .attr("ry", 4)
    //               .attr("class", "hour bordered")
    //               .attr("width", gridSize)
    //               .attr("height", gridSize)
    //               .style("fill", colors[0]);
    //            cards.transition().duration(1000)
    //             .style("fill", function(d) { return colorScale(d.value); });
    //         cards.select("title").text(function(d) { return d.value; });

    //         cards.exit().remove();
    //         var legend = svg.selectAll(".legend")
    //             .data([0].concat(colorScale.quantiles()), function(d) { return d; });
    //         legend.enter().append("g")
    //             .attr("class", "legend");
    //         legend.append("rect")
    //           .attr("x", function(d, i) { return legendElementWidth * i; })
    //           .attr("y", height)
    //           .attr("width", legendElementWidth)
    //           .attr("height", gridSize / 2)
    //           .style("fill", function(d, i) { return colors[i]; });
    //         legend.append("text")
    //           .attr("class", "mono")
    //           .text(function(d) { return "≥ " + Math.round(d); })
    //           .attr("x", function(d, i) { return legendElementWidth * i; })
    //           .attr("y", height + gridSize);
    //         legend.exit().remove();



    // var countrypicker = d3.select("#country_picker").selectAll(".country-button")
    //       .data(countries);
    // countrypicker.enter()
    //       .append("input")
    //       .attr("type", "button")
    //       .attr("class", "country-button")
    //       .on("click", function(d) {
    //         //heatmapChart(d);
    //       });


    heatmapChart(file_csv,countries,dates);
    var mySlider = new rSlider({
        target: '#slider',
        values: [1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
        range: true, // range slider
        //set:    null, // an array of preselected values
        width:    500,
        scale:    false,
        labels:   false,
        tooltip:  true,
        step:     10, // step size
        disabled: false, // is disabled?
        onChange: (function (values) {
            var dates_vector=values.split(",");//transform to ['1960','2014']
            var lower_date= +dates_vector[0];
            var higher_date= +dates_vector[1];
            dates=[lower_date,higher_date];
            heatmapChart(file_csv,countries,dates);
            updateMap();
        }) // callback
    });
