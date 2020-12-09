// Constants
const DINGUS_PRICE = 14.25;
const WIDGET_PRICE = 9.99;
const ZERO_FORMAT = '0.00';
const DEBUG = true; // Where might this flag be used? (It's not mandatory)
const radius = 100;
const yTickInterval = 320/6;
const tickInterval = 6/5;
const yAxis_yPos = 320;

// Global store (What else would you need here?)
let store = {
	orderHistory: generateEntries(),
	currID: generateEntries().length,
	dates: generateDatesQuantities(true),
	currDingusQuantity: 0, //quantity of a particular order
	currWidgetQuantity: 0, //quantity of a particular order
	dingusQuantity: 0, //total
	widgetQuantity: 0, //total
	total: 0,
	totalQuantity: 0,
	totalQuantityPerDayD: generateDatesQuantities(false),
	totalQuantityPerDayW: generateDatesQuantities(false),
	maxY: 0
  };


function generateEntries() {
	// Returns an orderHistory array
	// [ID#, Date, Dingus quantity, Widget quantity]
	return [
		[1, '01/01/2020', 1, 1], 
		[2, '01/02/2020', 2, 2],
	]
}

function generateDatesQuantities(isDates) {
	let dtmp = [];
	let qtmp = {};
	let dates = generateEntries();
	for (var i = 0; i < dates.length; i++) {
		let d = dates[i][1];
		if (!dtmp.includes(d)) {
			dtmp.push(d);
			qtmp[d] = 0;
		}
	}
	if (isDates) {
		return dtmp
	} else {
		return qtmp
	}

}


///////////////////////////////////////// INITIAL LOAD //////////////////////////////////////////

// load table to initial state
function load() {
	for (let i = 0; i < localStorage.length; i++) {
		let key = localStorage.key(i);
		let val = JSON.parse(localStorage.getItem(key.toString()));
		store[key] = val;
	}
	fillTable(store.orderHistory);
}

////////////////////////////////////////// CHARTS /////////////////////////////////////////////

////////// BAR //////////
function makeXAxis(){
	htmlString = ''
	for (var i = 1; i <= store.dates.length; i++) {
		htmlString += '<text x=';
		htmlString += (i/(store.dates.length+1))*100+ '% ';
		htmlString += 'y="337">';
		htmlString += store.orderHistory[i-1][1];
		htmlString += '</text>';
	}
	htmlString+='<text x="60%" y="80%" style="text-anchor: end;">Date</text>';
	document.getElementById("x-ticks").innerHTML=htmlString;
 }

function makeYAxis() {
	
	// combine widgetdata with dingusdata to find total units sold per day
	let tmp1 = Object.values(store.totalQuantityPerDayD)
	let tmp2 = Object.values(store.totalQuantityPerDayW)
	let array = [tmp1,tmp2];
	// find the biggest y; this will let us scale y axis properly
	result = array.reduce((r, a) => a.map((b, i) => (r[i] || 0) + b), []);
    store.maxY = Math.max.apply(null,result);
	
	htmlString = ''
	// we want 6 tick marks
	for (var i = 0; i <6; i++) {
		htmlString += '<text x="8%" y=';
		htmlString += (((i+1)*yTickInterval)+6);
		htmlString += '>';
		htmlString += (((5-i)/5)*store.maxY).toFixed(0);
		htmlString += '</text>'
	}
	htmlString += '<text transform="rotate(-90)" x= "-20%" y="2.5%" style="text-anchor: end;">Units Sold Per Day</text>'
	document.getElementById("y-ticks").innerHTML=htmlString;
}

function makeBar() {

	HTMLString = '';
	for(var i=0; i<store.dates.length; i++) {
		let dColHeight = (store.totalQuantityPerDayD[store.dates[i]]*320)/(tickInterval*store.maxY);
		let wColHeight = (store.totalQuantityPerDayW[store.dates[i]]*320)/(tickInterval*store.maxY);

		HTMLString += '<rect class="dbar" x=';
		HTMLString += (( ( (i+1)/(store.dates.length+1) )*100)+2);
		HTMLString += '% y=';
		HTMLString += (yAxis_yPos - dColHeight);
		HTMLString += ' height=';
		HTMLString += (dColHeight);
		HTMLString += '></rect>';

		HTMLString += '<rect class="wbar" x=';
		HTMLString += (( ( (i+1)/(store.dates.length+1) )*100)+2);
		HTMLString += '% y=';
		HTMLString += (yAxis_yPos - dColHeight - wColHeight);
		HTMLString += ' height=';
		HTMLString += (wColHeight);
		HTMLString += '></rect>';
	}
	document.getElementById("cols").innerHTML = HTMLString;
}

///////////////// PIE /////////////////

function makePie() {
	let pieElem = document.getElementById('pie');
	
	// setting attributes for widget pie slice
	let wpieslice = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	wpieslice.setAttribute('r', '150');
	wpieslice.setAttribute('cx', '200');
	wpieslice.setAttribute('cy', '200');
	wpieslice.setAttribute('fill', 'slateblue');
	pieElem.appendChild(wpieslice);

	// setting attributes for dingus pie slice
	let dpieslice = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	dpieslice.setAttribute('r', '75');
	dpieslice.setAttribute('cx', '200');
	dpieslice.setAttribute('cy', '200');
	dpieslice.setAttribute('fill', 'transparent');
	dpieslice.setAttribute('stroke', 'lightskyblue');
	dpieslice.setAttribute('stroke-width', '150');

	// calculate dingus percentage based global dingus quantity 
	let dingusSlice = (store.dingusQuantity/store.totalQuantity) * 100;
	let percentSetter = 'calc(' + dingusSlice +' * 471.23889803847 / 100) 471.23889803847';
	dpieslice.setAttribute('stroke-dasharray', percentSetter);
	dpieslice.setAttribute('transform','rotate(-90) translate(-400)')
	pieElem.appendChild(dpieslice);

	console.log((store.dingusQuantity/store.totalQuantity) * 100)
	let dingusPercent = document.getElementById('dingusPercent');
	dingusPercent.innerHTML ='Dingus ('+(dingusSlice).toFixed(0).toString()+'%)';

	let widgetPercent = document.getElementById('widgetPercent');
	widgetPercent.innerHTML = 'Widget ('+((store.widgetQuantity/store.totalQuantity)*100).toFixed(0).toString()+'%)';

}
	
////////////////////////////////////////// ORDER FORM //////////////////////////////////////////

// once dingus or widget quantity fields are filled out: calculate total for widget or dingus and total for both
function updateTotal(quantity, dingus) {

	// if quantity is greater than 1 then enable order button
	if (quantity > 0) {
		document.getElementsByClassName("button-success pure-button")[0].disabled = false; 
	} 
	
	// some edge cases for inputs
	let d = document.getElementById("dingus").value;
	let w = document.getElementById("widget").value;
	

	let dingusTotal = 0;
	let widgetTotal = 0;

	// if quantity is from dingus field
	if (dingus==true) {
		dingusTotal = (quantity * DINGUS_PRICE).toFixed(2);
		document.getElementById("dtotal").value = dingusTotal;
		store.currDingusQuantity = Number(quantity);
	}
	// if quantity is from widget field
	if (dingus==false) {
		widgetTotal = (quantity * WIDGET_PRICE).toFixed(2);
		document.getElementById("wtotal").value = widgetTotal;
		store.currWidgetQuantity = Number(quantity);
	}
	// calculate total field
	let totalVal = Number(document.getElementById("dtotal").value) + Number(document.getElementById("wtotal").value);
	document.getElementById("total").value = totalVal.toFixed(2);

}

// once order button is hit: prepare array from order form to populate in table 
function prepOrder() {
	let d = new Date();
	let myDate =  (d.getDate() < 10 ? '0' : '') + d.getDate();
	let myMonth = (d.getMonth() < 10 ? '0' : '') + (d.getMonth() + 1);
	let myYear = d.getFullYear();
	store.currID += 1;
	

	//update global vars
	let fulldate = myMonth+'/'+myDate+'/'+myYear;
	let newOrder = [store.currID, fulldate, store.currDingusQuantity, store.currWidgetQuantity];
	store.orderHistory.push(newOrder);
	
	clearForm();
	fillTable([newOrder]);
	preserveTable();
}

//once cancel button is hit: replace user input with 0's
function clearForm() {
	store.currDingusQuantity = 0;
	store.currWidgetQuantity = 0;
	document.getElementById("dingus").value= 0;
	document.getElementById("dtotal").value= ZERO_FORMAT;
	document.getElementById("widget").value= 0;
	document.getElementById("wtotal").value= ZERO_FORMAT;
	document.getElementById("total").value= ZERO_FORMAT;
	document.getElementsByClassName("button-success pure-button")[0].disabled = true; 
}

////////////////////////////////////////// TABLE //////////////////////////////////////////

// fills table with values based on order form
function fillTable(arr) {
	// for every array in arr, add a row
	for (let i = 0; i < arr.length; i++) {
		let row = document.getElementById('OHBody').insertRow(-1); 
		// for every element, add a cell
		for (let j = 0; j < arr[i].length; j++) {
			let cell = row.insertCell(j);
			cell.innerHTML = arr[i][j];
		}
		
		//updating some global variables
		store.dingusQuantity += Number(arr[i][arr[i].length-2]);
		store.widgetQuantity += Number(arr[i][arr[i].length-1]);

		// for the last cell (total cell) & compute total sales 
		let currDingusQuantity = arr[i][arr[i].length-2];
		let currWidgetQuantity = arr[i][arr[i].length-1]
		let rowTotal = (currDingusQuantity * DINGUS_PRICE) + (currWidgetQuantity * WIDGET_PRICE);
		let cell = row.insertCell(arr[i].length);
		cell.innerHTML = '<span id="moneysign">$</span>' + rowTotal.toFixed(2);

		//update global vars
		store.total += Number(rowTotal);
		store.totalQuantity = store.dingusQuantity + store.widgetQuantity;
		
		if (!store.dates.includes(arr[i][1])) {
			store.dates.push(arr[i][1]);
			store.totalQuantityPerDayD[arr[i][1]] = 0;
			store.totalQuantityPerDayW[arr[i][1]] = 0;
		}

		console.log(arr[i][1])
		if (isNaN(store.totalQuantityPerDayD[arr[i][1]])) {
			store.totalQuantityPerDayD[arr[i][1]] = Number(arr[i][2]);
		} else {
			store.totalQuantityPerDayD[arr[i][1]] = Number(store.totalQuantityPerDayD[arr[i][1]])+Number(arr[i][2]);
		}
		if (isNaN(store.totalQuantityPerDayW[arr[i][1]])) {
			console.log("W is Nan");
			store.totalQuantityPerDayW[arr[i][1]] = Number(arr[i][3]);
		} else {
			store.totalQuantityPerDayW[arr[i][1]] = Number(store.totalQuantityPerDayW[arr[i][1]])+Number(arr[i][3]);
		}
		console.log(store.totalQuantityPerDayW);
	}

	updateScoreboard([store.dingusQuantity, store.widgetQuantity, store.total]);
	makePie();
	makeXAxis();
	makeYAxis();
	makeBar();
}

////////////////////////////////////////// SCOREBOARD //////////////////////////////////////////

// update scoreboard based on array outputted from filltable()
function updateScoreboard(entries) {
	document.getElementById('dingusval').innerHTML = entries[0];
	document.getElementById('widgetval').innerHTML = entries[1];
	document.getElementById('salesval').innerHTML = '<span id="moneysign">$</span>' + entries[2].toFixed(2);
}

////////////////////////////////////////// PRESERVING DATA //////////////////////////////////////////

// preserve data in table; courtesy of w3schools
function preserveTable() {
	// Check browser support
	if (typeof(Storage) !== "undefined") {
		// Store
		localStorage.setItem("orderHistory", JSON.stringify(store.orderHistory));
		// Retrieve
		localStorage.setItem("currID", JSON.stringify(store.currID));
	  } else {
		alert("Sorry, there is a problem with your browser!");
	}
}

load();
