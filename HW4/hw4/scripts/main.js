const DINGUS_PRICE = 14.25;
const WIDGET_PRICE = 9.99;
const ZERO_FORMAT = '0.00';
const DEBUG = true;
var dingus;
var widge;
var total_num;
var data;

// Some little helpers
const log = msg => (DEBUG ? console.log(msg) : '');
const select = id => document.getElementById(id);


function plotContinents(continents) {
	// breaks without this for some reason
	var data = [
		['eu', 0],
		['au', 1],
		['af', 2],
		['as', 3],
		['na', 4],
		['sa', 5],
		['an', 6]
	];
		
	// Create the chart
	Highcharts.mapChart('myMap', {
		chart: {
			height: 460, 
		},
		exporting: false,
		title: {
			text: ''
		},
		mapNavigation: {
			enabled: false,
		},
		// so that they are all the same gray color
		colorAxis: {
            minColor: '#dddddd',
            maxColor: '#dddddd'
		},
		legend: {
            enabled: false
		},
		tooltip: {
			enabled: true,
			pointFormat: '<b>{point.name}</b>',
			headerFormat: '',
			borderColor: 'darkgray',
			borderRadius: 15
		},
		plotOptions:{
        	series:{
            	point:{
                	events:{
                    	click: function(){
							// so name in continents matches sales.json
							let cont = this.name.replace('<br>', '')
							//update Scoreboard
							console.log(cont);
							updateScoreCards(cont);
							plotPie(cont);
							plotColumn(cont);

                        }
                    }
                }
            }
        },
		series: [{
			data: data,
			mapData: continents,
			name: '',
			borderColor: 'white',
			allowPointSelect: true,
            cursor: 'pointer',
			states: {
				hover: {
					color: 'darkgray',
					borderColor: 'white',
				},
				select: {
                    color: '#7ca82b',
                    borderColor: '#7ca82b',
				},
			},
			mouseOver: function () {
				this.color('green');
			},
			dataLabels: {
				enabled: true,
				format: '{point.name}',
				style: {
					font:'Arial',
					fontWeight: 'normal',
					fontSize: '9px',
					color: 'black',
					textOutline: 'none',

				}
			},

		}]
	});
}


function plotPie(continent) {

	if (continent == 'ANTARCTICA') {
		Highcharts.chart('totalSalesChart', {
			title: ''
		})
		return;
	}
	let dingusValues = {
		values: [],
		text: "Dinguses"
	}
	let widgetValues = {
		values: [],
		text: "Widgets"
	}
	let sales = data[continent];
	let dinguses = 0, widgets = 0;
	for (const datum of sales) {
		dinguses += datum['Dingus'];
		widgets += datum['Widget'];
	}
	dingusValues['values'].push(dinguses);
	widgetValues['values'].push(widgets);

	Highcharts.setOptions({
		colors: ['#29a2cc','#d31e1d']
	});
	
	Highcharts.chart('totalSalesChart', {

		exporting: false,
		chart: {
			type:'pie',
		},
		legend: {
			align: 'right',
			layout: 'vertical',
			verticalAlign: 'top',
			floating: true,
			borderWidth: 1,
			symbolRadius: 0,
		},
		title: {
			text: 'Total Sales',
			style: {
				fontSize: '1.5vw',
				fontWeight: 'bold',
				font: 'Arial'
			}
		},
		plotOptions: {
			pie: {
				allowPointSelect:true,
				cursor: 'pointer',
				startAngle: 90,
				dataLabels: {
					enabled: true,
					format: '<br>{point.percentage:.1f} %<br>',
					distance: -80,
					style: {
						fontSize: 18,
						stroke: 'none',
						color:'white',
						textOutline: 'none'
					}
				},
				showInLegend: true,
				slicedOffset: 20,
				// fix the legend click, prevent slice from disappearing
                point: {
					events: {
						legendItemClick: function () {
							var colors = this.series.chart.options.colors;
							var newColor = (
								this.color == 'transparent' 
								? colors[this.index] 
								: 'transparent'
							);
							this.update({color:newColor});
							return false; 
						}
					}
				},
				series: {
					shadow: true,
				},
				states: {
					inactive: {
						opacity: 1
					},
					hover: {
						halo: {
							size: 0,
						},
						brightness: -0.1,
					}
				},
			}
		},
		tooltip: {
            shared: false,
			useHTML: true,
			followPointer: true,
			borderWidth: 0,
            shadow: false,
            backgroundColor: 'rgba(255,255,255,0)',
            formatter: function() {
                return '<div class="myTooltip" style="padding: 5px; border: 1px solid white; font-size: 1.0vw; color: white;  background-color:' + this.series.color + ';">' + this.y + '</div>';
			},
		},
		series: [{
			data: [{
				name: 'Dinguses',
				y: dingusValues.values[0],
				color: '#29a2cc',
				states: { hover: { enabled: false } }, 
			}, {
				name: 'Widgets',
				y: widgetValues.values[0],
				color: '#d31e1d',
				states: { hover: { enabled: false } }, 
			}]
		}]
	})
}


function plotColumn(continent) {
	// for data
	let dingusValues = [];
	let widgetValues = [];
	let cats = [];
	let sales = data[continent];
	for (const datum of sales) {
		let month = datum['Month'];
		let dingus = datum['Dingus'];
		let widget = datum['Widget'];
		cats.push(month);
		dingusValues.push(dingus); 
		widgetValues.push(widget); 
	}

	Highcharts.chart('salesPerMonthChart', {
		exporting: false,
		chart: {
			type: 'column',
			reflow: true,
			animation: false,
		},
		legend: {
			align: 'right',
			verticalAlign: 'top',
			layout: 'vertical',
			floating: true,
			borderWidth: 1,
			symbolRadius: 0
		},
		title: {
			text: 'Monthly Sales',
			style: {
				fontSize: '1.5vw',
				fontWeight: 'bold',
				fontFamily:'Arial',
			}
		},
		xAxis: {
			title: {
			text: 'Month',
			style: {
				fontSize: '0.7vw',
				fontWeight: 'bold',
				font: 'Arial',
				color: 'black'
			}
			},
			categories: cats,//
			lineWidth: 1, //
			lineColor: 'gray',//
			tickWidth: 1, //
			tickLength: 5, //
			tickColor: 'gray', 
		},
		yAxis: {
			softMax: 1.0,
			title: {
				text: 'Number of units sold',
				style: {
					fontSize: '0.7vw',
					fontWeight: 'bold',
					font: 'Arial',
					color: 'black'
				}
			},
			lineWidth: 1, 
			lineColor: 'gray',
			tickWidth: 1, 
			tickLength: 8, 
			tickColor: 'gray', 
			tickInterval: 10,
			endOnTick: false, 
		},
		tooltip: {
            shared: false,
			useHTML: true,
			followPointer: true,
			borderWidth: 0,
            shadow: false,
            backgroundColor: 'rgba(255,255,255,0)',
            formatter: function() {
                return '<div class="myTooltip" style="padding: 5px; border: 1px solid white; font-size: 1.0vw; color: white;  background-color:' + this.series.color + ';">' +this.y + '</div>';
			},
		},
		plotOptions: {
			column: {
				pointPadding: 0.05,
				groupPadding: 0.1,
			},
			// disables series fading					
			series: {
				pointPadding: 0.001,
				states: {
					inactive: {
						opacity: 1
					},
					hover: {
						brightness: -0.1,
					}
				}
			}
		},
		series: [{
			name: 'Dinguses',
			data: dingusValues,
			color: '#29a2cc',
			// prevents the hover effect on columns
			//states: { hover: { enabled: false } }, 
		}, {
			name: 'Widgets',
			data: widgetValues,
			color: '#d31e1d',
			//states: { hover: { enabled: false } }, 
		}]
	});
}
	
function updateScoreCards(continent) {
	  let sales = data[continent];
	  let dinguses = 0, widgets = 0;
	  console.log(continent);
	  console.log(data[continent]);
	  for (const datum of sales) {
		  dinguses += datum['Dingus'];
		  widgets += datum['Widget'];
	  }
	  let revenue = DINGUS_PRICE * dinguses + WIDGET_PRICE * widgets;
	  select('dingusSold').innerHTML = "<span style='font-size:2.2vw'>" + dinguses + "</span>";
	  select('widgetSold').innerHTML =  "<span style='font-size:2.2vw'>" + widgets + "</span>";;
	  select('totalSales').innerHTML =  "<span style='font-size:2.2vw'>" + revenue.toFixed(2) + "</span>";
}

async function loadJSON(path) {
	let response = await fetch(path);
	let dataset = await response.json(); // Now available in global scope
	return dataset;
}

function plotStocks(stocks){
	let prices = [];
	for (datum of stocks) {
		prices.push([datum['Date'], datum['Adj Close']]);
	}

	Highcharts.setOptions({
		global: {
			useUTC : false,
			timezone: "America/Los_Angeles"
		}
	});	

	Highcharts.chart('stockChart', {
		exporting: { 
			enabled: false 
		},
		chart: {
			zoomType: 'xy',
			//width: "20%", 
			reflow: true
		},
		title: {
			text: 'Dynamic Growth',
			style: {
				fontSize: '21px',
				fontWeight: 'bold',
				font: 'Arial'
			}
		},
		subtitle: {
			text: 'Stock Prices of D&W Corp. from 2015-Present',
			style: {
				fontSize: '11px',
				fontWeight: 'bold',
				font: 'Arial',
				color: 'black'
			}
		},
		xAxis: {
			title :{
				text: 'Date',
				style: {
					fontSize: '11px',
					fontWeight: 'bold',
					font: 'Arial',
					color: 'black',
				}
			},
			minPadding:0, // get edge to edge
			maxPadding:0,
			lineColor: 'gray',
			type: 'datetime',
			// to get weird x axis ticks: two dates are off though
			tickPositioner: function () {
				var positions = [],
					tick = this.dataMin,
					endTick = 1579564800000,
					i = 0;
					increment = Math.ceil((endTick - this.dataMin) / 13);

				if (this.dataMax !== null && this.dataMin !== null) {
					for (tick; tick - increment <= endTick-increment; tick += increment) {
						positions.push(tick);
					}
				}
				//push the last datapoint in 
				positions.push(this.dataMax);
				//console.log(positions);
				return positions;
			},	
			labels: {
				format: '{value: %m/%e/%y}'
			},
			// crosshair lines & box
			crosshair: {
				width: 1,
				color: 'gray',
				label: {
					enabled: true,
					padding: 8,
					format: '{value: %m/%e/%y}',
					backgroundColor: 'gray'
				}
			},
		},
		// box on hover
		tooltip: {
			headerFormat: '',
			pointFormat: '<b>${point.y}</b>',
		},
		yAxis: {
			title: {
				text: 'Adj Close Stock Price',
				style: {
					fontSize: '11px',
					fontWeight: 'bold',
					font: 'Arial',
					color: 'black'
				}
			},
			lineWidth: 1,
			lineColor: 'gray',
			tickInterval: 20, 
			tickWidth: 1,
			tickLength: 8,
			tickColor: 'gray',
			endOnTick: false, //so highest y is only 160 instead of 180
			gridLineDashStyle: 'dash',
			crosshair: {
				label: {
					enabled: true,
					format: '{value:.0f}',
					backgroundColor: '#29a2cc'
				},
				width: 1,
				color: 'gray',
			}
		},
		legend: {
			enabled: false
		},
		plotOptions: {
			area: {
				color: '#cfe7f2',
				marker: {
					states: {
						hover: {
							enabled: false
						}
					}
				},
				lineWidth: 2,
				states: {
					hover: {
						lineWidth: 2
					}
				},
				threshold: null
			},
			// blue line & blue area
			series: {
				fillOpacity: 0.75,
				lineColor: '#29a2cc',
				lineWidth: 10
			},
		},
		series: [{
			type: 'area',
			name: 'USD to EUR',
			data: prices,
			tooltip: {
				valueDecimals: 2
			},
		}]
	});
	 
}
	 
function init() {
	salesPromise = loadJSON('../hw4/data/sales.json');
	stocksPromise = loadJSON('../hw4/data/stocks.json');
	continentsPromise = loadJSON('../hw4/data/continents.json');
	salesPromise.then(function (sales) {
		data = sales;
	});
	stocksPromise.then(function (stocks) {
		plotStocks(stocks);
	});
	continentsPromise.then(function (continents) {
		plotContinents(continents);
	});
}

document.addEventListener('DOMContentLoaded', init, false);


