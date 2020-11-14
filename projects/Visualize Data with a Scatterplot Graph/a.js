let width = 920,
    height = 620,
    padding = 20;

const colors = ["#1c698d", "#c4cbed"];

var div = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .style('opacity', 0);

var svg = d3.select(".visholder")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var legendContainer = svg.append("g")
    .attr("id", "legend")

var legend = legendContainer.selectAll("#legend")
    .data(colors)
    .enter()
    .append('g')
    .attr('class', 'legend-label')
    .attr('transform', function (d, i) {
        return `translate( ${width - padding * 2}, ${(height / 2 - i * 22)})`;
    })

legend.append("rect")
    .attr("width", "20")
    .attr("height", "20")
    .attr("fill", function (d) {
        return d
    });
legend.append("text")
    .attr('x', `${0 - padding / 2}`)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'end')
    .text(function (d) {
        console.log(d)
        if (d == "#1c698d") {
            return 'Riders with doping allegations';
        } else {
            return 'No doping allegations';
        }
    });

fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
    .then(response => response.json())
    .then(data => {
        var x = d3.scaleLinear().domain([
            d3.min(data, function (d) {
                return d.Year - 1;
            }),
            d3.max(data, function (d) {
                return d.Year + 1;
            })
        ]).range([0, width]);

        var y = d3.scaleTime().range([0, height]);

        var timeFormat = d3.timeFormat('%M:%S');
        var xAxis = d3.axisBottom(x).tickFormat(d3.format('d'));

        var yAxis = d3.axisLeft(y).tickFormat(timeFormat);

        data.forEach(function (d) {

            var parsedTime = d.Time.split(':');
            d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]));
        });

        y.domain(
            d3.extent(data, function (d) {
                return d.Time;
            })
        );
        svg
            .append('g')
            .attr('class', 'x axis')
            .attr('id', 'x-axis')
            .attr('transform', `translate(${50},${height - padding})`)
            .call(xAxis)
            .append('text')
            .attr('class', 'x-axis-label')
            .attr('x', width)
            .attr('y', 0)
            .style('text-anchor', 'end')
            .text('Year');
        svg
            .append('g')
            .attr('class', 'y axis')
            .attr('id', 'y-axis')
            .attr('transform', `translate(50, ${0 - padding})`)
            .call(yAxis)
            .append('text')
            .attr('class', 'label')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0)
            .attr('dy', '100')
            .style('text-anchor', 'end')
            .text('Best Time (minutes)');

        svg
            .selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('r', 6)
            .attr('cx', function (d) {
                return x(d.Year) + 50;
            })
            .attr('cy', function (d) {
                return y(d.Time) - 20;
            }).attr('data-xvalue', function (d) {
                return d.Year;
            })
            .attr('data-yvalue', function (d) {
                return d.Time.toISOString();
            })
            .attr('data-fill', function (d) {
                return d.Doping !== "" ? "#1c698d" : "#c4cbed";
            })
            .style('fill', function (d) {
                return d.Doping !== "" ? "#1c698d" : "#c4cbed";
            }).on('mouseover', function (e, d) {
                div.style("display", "block")

                console.log(e.target.dataset.fill)
                div.style("background", e.target.dataset.fill)
                div.transition().duration(200).style('opacity', 0.9);
                div.attr('data-year', d.Year);
                div
                    .html(`
                    ${d.Name}: ${d.Nationality}<br/>
                        Year: ${d.Year} Time: ${timeFormat(d.Time)}
                        ${(d.Doping ? '<br/><br/>' + d.Doping : '')}
                    `
                    )
                    .style('left', (e.pageX + 20) + 'px')
                    .style('top', e.pageY - 28 + 'px');
            })
            .on('mouseout', function () {
                div.transition().duration(200).style('opacity', 0);
                div.style("display", "none")
            });
    })