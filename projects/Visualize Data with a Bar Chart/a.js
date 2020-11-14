var width = 800,
    height = 400,
    barWidth;

var tooltip = d3
    .select('.visHolder')
    .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0);


var svgContainer = d3
    .select('.visHolder')
    .append('svg')
    .attr('width', width + 100)
    .attr('height', height + 60);

svgContainer
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -250)
    .attr('y', 80)
    .text('Gross Domestic Product');

svgContainer
    .append('text')
    .attr('x', width / 2 + 50)
    .attr('y', height + 50)
    .text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
    .attr('class', 'info');


fetch("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json")
    .then(Response => Response.json())
    .then(({ data }) => {
        barWidth = width / data.length;

        var years = data.map(function (item) {
            var quarter;
            var temp = item[0].substring(5, 7);

            if (temp === '01') {
                quarter = 'Q1';
            } else if (temp === '04') {
                quarter = 'Q2';
            } else if (temp === '07') {
                quarter = 'Q3';
            } else if (temp === '10') {
                quarter = 'Q4';
            }

            return item[0].substring(0, 4) + ' ' + quarter;
        });

        var yearsDate = data.map(function (item) {
            return new Date(item[0]);
        });
        var xMax = new Date(d3.max(yearsDate));

        var xScale = d3
            .scaleTime()
            .domain([d3.min(yearsDate), xMax])
            .range([0, width]);

        var xAxis = d3.axisBottom().scale(xScale);

        svgContainer
            .append('g')
            .call(xAxis)
            .attr('id', 'x-axis')
            .attr('transform', 'translate(60, 410)');

        var GDP = data.map(function (item) {
            return item[1];
        });

        var scaledGDP = [];

        var gdpMax = d3.max(GDP);

        var linearScale = d3.scaleLinear().domain([0, gdpMax]).range([0, height]);

        scaledGDP = GDP.map(function (item) {
            return linearScale(item);
        });

        var yAxisScale = d3.scaleLinear().domain([0, gdpMax]).range([height, 0]);

        var yAxis = d3.axisLeft(yAxisScale);

        svgContainer
            .append('g')
            .call(yAxis)
            .attr('id', 'y-axis')
            .attr('transform', 'translate(60, 10)');

        d3.select('svg')
            .selectAll('rect')
            .data(scaledGDP)
            .enter()
            .append('rect')
            .attr('data-date', function (d, i) {
                return data[i][0];
            })
            .attr('data-gdp', function (d, i) {
                return data[i][1];
            })
            .attr('class', 'bar')
            .attr('x', function (d, i) {
                return xScale(yearsDate[i]);
            })
            .attr('y', function (d) {
                return height - d + 10;
            })
            .attr('width', barWidth)
            .attr('height', function (d) {
                return d;
            })
            .attr('transform', 'translate(60, 0)')
            .on('mouseover', function (d, i) {
                const usNumberFormat = new Intl.NumberFormat('en-US');
                const usNumber = usNumberFormat.format(this.dataset.gdp); // 99,999,999.99
                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip
                    .html(
                        this.dataset.date +
                        '<br>' +
                        '$' + usNumber +
                        ' Billion'
                    )
                    .attr('data-date', this.dataset.date)
                    .style('left', (d.layerX - 130) + 'px')
                    .style('top', (d.clientY - 100) + 'px')
                    .style('transform', 'translateX(60px)');
                // console.log(barWidth)
            })
            .on('mouseout', function () {
                tooltip.transition().duration(200).style('opacity', 0);
            });
    })