// document.getElementById("search").addEventListener("click", searchQuery);
// document.getElementById("upload-button").addEventListener("click", addDataset);
//
// function addDataset() {
// 	const fileInput = document.querySelector('#zip-file');
// 	const file = fileInput.files[0];
// 	alert(`upload zip file: ${file.name}`);
//
// 	const xhr = new XMLHttpRequest();
// 	xhr.open('PUT', 'http://localhost:4321/dataset/sections/sections');
// 	xhr.onload = function () {
// 		if (xhr.status === 200) {
// 			console.log('Dataset added successfully');
// 		} else {
// 			console.log('Error adding dataset');
// 		}
// 	};
// 	xhr.send(file);
// }
//
// function MCOMPARATOR(input) {
// 	if (input === "greater") {
// 		return "GT";
// 	} else if (input === "less"){
// 		return  "LT";
// 	} else if (input === "equal"){
// 		return "EQ";
// 	}
// }
//
// function LOGIC(input) {
// 	if (input === "and") {
// 		return "AND";
// 	} else if (input === "or"){
// 		return  "OR";
// 	}
// }
//
// function searchQuery() {
// 	// Get the search input values
// 	const department = document.querySelector('#department-input').value;
// 	const avg = parseFloat(document.querySelector('#avg-input').value);
// 	const avgComparison = MCOMPARATOR(document.querySelector("#avg-comparison").value);
// 	const year = parseFloat(document.querySelector('#year-input').value);
// 	const yearComparison = MCOMPARATOR(document.querySelector('#year-comparison').value);
// 	const logicOption = LOGIC(document.querySelector('#logic-option').value);
// 	let query = {
// 		"WHERE":{
// 			"AND":[
// 				{
// 					[logicOption]:[
// 						{
// 							[avgComparison]:{
// 								"sections_avg":avg
// 							}
// 						},
// 						{
// 							[yearComparison]:{
// 								"sections_year":year
// 							}
// 						}
// 					]
// 				},
// 				{
// 					"IS":{
// 						"sections_dept":"cpsc"
// 					}
// 				}
// 			]
// 		},
// 		"OPTIONS":{
// 			"COLUMNS":[
// 				"sections_dept",
// 				"sections_id",
// 				"sections_avg",
// 				"sections_year"
// 			],
// 			"ORDER":"sections_avg"
// 		}
// 	};
// 	let formattedQuery = JSON.stringify(query, null, 2);
//
// 	const xhr = new XMLHttpRequest();
// 	xhr.open('POST', 'http://localhost:4321/query');
// 	xhr.setRequestHeader('Content-Type', 'application/json');
// 	xhr.onload = function () {
// 		if (xhr.status === 200) {
// 			console.log('Query executed successfully');
// 			const response = JSON.parse(xhr.responseText);
// 			displayResult(response.result); // assuming you have a function called displayResult that generates a table from the response object
// 		} else {
// 			console.log('Error executing query');
// 		}
// 	};
// 	xhr.send(formattedQuery);
// }
//
// function displayResult(result){
// 	let tableBody = document.querySelector('#data-out');
// 	let out = "";
// 	for(let res of result) {
// 		out += `
// 			<tr>
// 				<td>${res.sections_dept}</td>
// 				<td>${res.sections_id}</td>
// 				<td>${res.sections_avg}</td>
// 				<td>${res.sections_year}</td>
// 			</tr>
// 			`
// 	}
// 	tableBody.innerHTML = out;
// }
//
//

let query = new Object(null);
query.WHERE = Object.create(null);
query.OPTIONS = {
	"COLUMNS": [
		"sections_uuid",
		"sections_year",
		"sections_dept",
		"sections_id",
		"sections_title",
		"sections_instructor",
		"sections_avg",
		"sections_pass",
		"sections_fail",
		"sections_audit"
	],
	"ORDER": "sections_avg"
}
let dC = 0, aC = 0, yC = 0;
let deptContent, avgFil, avgContent, yearFil, yearContent;
// console.log(logic);

let deptCheck = document.getElementById("department-box");
deptCheck.addEventListener("change", function() {
	dC = 1;
	deptContent = document.getElementById("department-input").value;
})

let avgCheck = document.getElementById("avg-box");
// avgCheck.onchange = (ev) => {
// 	aC = 1;
// 	avgFil = document.getElementById("avg-option").value;
// 	avgContent = document.getElementById("avg-input").value;
// }
avgCheck.addEventListener("change", function() {
	if (this.checked) {
		console.log("checked");
		aC = 1;
		avgFil = document.getElementById("avg-option").value;
		avgContent = document.getElementById("avg-input").value;
		console.log(aC);
	}
})
console.log(avgContent, avgFil);
let yearCheck = document.getElementById("year-box");
yearCheck.addEventListener("change", function() {
	yC = 1;
	yearFil = document.getElementById("year-option").value;
	yearContent = document.getElementById("year-input").value;
})
// console.log(dC, aC, yC);

function handleString(name, content) {
	let obj = Object.create(null);
	obj.IS = Object.create(null);
	let s = "sections_";
	obj.IS[s.concat(name)] = content;
	return obj;
}
function handleNumber(filter, name, content) {
	let obj = Object.create(null);
	obj[filter] = Object.create(null);
	let s = "sections_";
	obj[filter][s.concat(name)] = content;
	console.log(obj);
	return obj;
}

let clear = document.getElementById("clear-button");
clear.addEventListener("click", function() {
	console.log("clear");
});

document.getElementById("search-button")
	.addEventListener("click", handleSearch);

function handleSearch() {
	let logic = document.getElementById("logic-option").value;
	if(logic == "none") {
		console.log("none");
		if (dC == 1) {
			console.log("dept");
			query.WHERE = handleString("dept", deptContent);
		} else if (aC == 1) {
			console.log("avg");
			query.WHERE = handleNumber(avgFil, "avg", avgContent);
		} else {
			console.log("year");
			query.WHERE = handleNumber(yearFil, "year", yearContent);
		}
	} else {
		console.log("have");
		query.WHERE[logic] = [];
		if (dC == 1) {
			query.WHERE[logic].push(handleString("dept", deptContent));
		}
		if (aC == 1) {
			query.WHERE[logic].push(handleNumber(avgFil, "avg", avgContent));
		}
		if (yC == 1) {
			query.WHERE[logic].push(handleNumber(yearFil, "year", yearContent));
		}
	}
	// console.log("a");
	console.log(query);
	// console.log(dC, aC, yC);
	let body = JSON.stringify(query);
	let request = new XMLHttpRequest();
	request.open('POST', 'http://localhost:4321/query');
	request.responseType = 'json';
	request.setRequestHeader('Content-Type', 'application/json');
	request.onload = function () {
		if (request.status === 200) {
			const response = JSON.parse(request.responseText);
			handleResult(response.result); // assuming you have a function called displayResult that generates a table from the response object
		} else {
			console.log('Error executing query');
		}
	};
	request.send(body);
}

function handleResult(result) {
	let tableBody = document.querySelector('#resultTable');
	let out = "";
	for(let res of result) {
		out += `
			<tr>
				<td>${res.sections_dept}</td>
				<td>${res.sections_id}</td>
				<td>${res.sections_avg}</td>
				<td>${res.sections_year}</td>
				<td>${res.sections_pass}</td>
				<td>${res.sections_fail}</td>
			</tr>
			`
	}
	tableBody.innerHTML = out;
}
