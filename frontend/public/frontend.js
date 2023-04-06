// document.getElementById("search").addEventListener("click", searchQuery);
// document.getElementById("upload-button").addEventListener("click", addDataset);
//
// function addDataset(event) {
// 	event.preventDefault();
// 	const fileInput = document.querySelector('#zip-file');
// 	const file = fileInput.files[0];
//
// 	// const xhr = new XMLHttpRequest();
// 	// xhr.open('PUT', 'http://localhost:4321/dataset/sections/sections');
// 	// xhr.send(file);
// 	fetch('http://localhost:4321/dataset/sections/sections', {
// 		method: 'PUT',
// 		body: file
// 	}).then(response => {
// 		if (response.ok) {
// 			alert('Dataset uploaded successfully');
// 		} else {
// 			alert('Error uploading dataset');
// 		}
// 	}).catch(error => {
// 		alert('Error uploading dataset:', error);
// 	});
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
// function searchQuery(event) {
// 	event.preventDefault();
// 	// Get the search input values
// 	const department = document.querySelector('#department-input').value;
// 	const avg = parseFloat(document.querySelector('#avg-input').value);
// 	const avgComparison = MCOMPARATOR(document.querySelector("#avg-comparison").value);
// 	const year = parseFloat(document.querySelector('#year-input').value);
// 	const yearComparison = MCOMPARATOR(document.querySelector('#year-comparison').value);
// 	const logicOption = LOGIC(document.querySelector('#logic-option').value);
//
// 	let query = {};
//
// 	if (avg > 100 || avg < 0) {
// 		alert('Please enter a valid number for the average (min: 0, max: 100)');
// 		return;
// 	}
//
// 	if (year > 2016 || year < 1900) {
// 		alert('Please enter a valid number for the year (min: 1900, max 2022)');
// 		return;
// 	}
//
// 	if (!document.querySelector('#select-all-departments').checked && department === '') {
// 		alert('Please enter a department or select "Select All"');
// 		return;
// 	}
//
// 	let whereClause = {
// 		[logicOption]: [
// 			{
// 				[avgComparison]: {
// 					"sections_avg": avg
// 				}
// 			},
// 			{
// 				[yearComparison]: {
// 					"sections_year": year
// 				}
// 			}
// 		]
// 	};
//
// 	if (document.querySelector('#select-all-departments').checked) {
// 		query = {
// 			"WHERE": whereClause,
// 			"OPTIONS": {
// 				"COLUMNS": [
// 					"sections_dept",
// 					"sections_id",
// 					"sections_avg",
// 					"sections_year"
// 				],
// 				"ORDER": "sections_avg"
// 			}
// 		};
// 	} else {
// 		query = {
// 			"WHERE": {
// 				"AND": [
// 					whereClause,
// 					{
// 						"IS": {
// 							"sections_dept": department
// 						}
// 					}
// 				]
// 			},
// 			"OPTIONS": {
// 				"COLUMNS": [
// 					"sections_dept",
// 					"sections_id",
// 					"sections_avg",
// 					"sections_year"
// 				],
// 				"ORDER": "sections_avg"
// 			}
// 		};
// 	}
//
// 	let formattedQuery = JSON.stringify(query, null, 2);
//
// 	fetch('http://localhost:4321/query', {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json'
// 		},
// 		body: formattedQuery
// 	}).then(response => {
// 		if (response.ok) {
// 			alert('Query executed successfully');
// 			response.json().then(data => {
// 				displayResult(data.result);
// 			});
// 		} else {
// 			alert('Error executing query');
// 		}
// 	}).catch(error => {
// 		alert('Error executing query:', error);
// 	});
// }
//
// function displayResult(result){
// 	const tableBody = document.querySelector("#resultTable tbody");
// 	tableBody.innerHTML = ""; // clear previous contents of the table
// 	result.forEach((row) => {
// 		const tr = document.createElement("tr");
// 		const tdDept = document.createElement("td");
// 		const tdId = document.createElement("td");
// 		const tdAvg = document.createElement("td");
// 		const tdYear = document.createElement("td");
//
// 		tdDept.innerText = row.sections_dept;
// 		tdId.innerText = row.sections_id;
// 		tdAvg.innerText = row.sections_avg;
// 		tdYear.innerText = row.sections_year;
//
// 		tdDept.style.verticalAlign = "middle";
// 		tdId.style.verticalAlign = "middle";
// 		tdAvg.style.verticalAlign = "middle";
// 		tdYear.style.verticalAlign = "middle";
//
// 		tr.appendChild(tdDept);
// 		tr.appendChild(tdId);
// 		tr.appendChild(tdAvg);
// 		tr.appendChild(tdYear);
//
// 		tableBody.appendChild(tr);
// 	});
// }


document.getElementById("search").addEventListener("click", searchQuery);
document.getElementById("upload-button").addEventListener("click", addDataset);

function addDataset(event) {
	event.preventDefault();
	const fileInput = document.querySelector('#zip-file');
	const file = fileInput.files[0];

	// const xhr = new XMLHttpRequest();
	// xhr.open('PUT', 'http://localhost:4321/dataset/sections/sections');
	// xhr.send(file);
	fetch('http://localhost:4321/dataset/sections/sections', {
		method: 'PUT',
		body: file
	}).then(response => {
		if (response.ok) {
			alert('Dataset uploaded successfully');
		} else {
			alert('Error uploading dataset');
		}
	}).catch(error => {
		alert('Error uploading dataset:', error);
	});
}

function MCOMPARATOR(input) {
	if (input === "greater") {
		return "GT";
	} else if (input === "less"){
		return  "LT";
	} else if (input === "equal"){
		return "EQ";
	}
}

function LOGIC(input) {
	if (input === "and") {
		return "AND";
	} else if (input === "or"){
		return  "OR";
	}
}

function searchQuery(event) {
	event.preventDefault();
	// Get the search input values
	const department = document.querySelector('#department-input').value;
	const avg = parseFloat(document.querySelector('#avg-input').value);
	const avgComparison = MCOMPARATOR(document.querySelector("#avg-comparison").value);
	const year = parseFloat(document.querySelector('#year-input').value);
	const yearComparison = MCOMPARATOR(document.querySelector('#year-comparison').value);
	const logicOption = LOGIC(document.querySelector('#logic-option').value);


	let query = {
		"WHERE": {},
		"OPTIONS": {
			"COLUMNS": [
				"sections_dept",
				"sections_id",
				"sections_title",
				"sections_avg",
				"sections_year"
			],
			"ORDER": "sections_avg"
		}
	};

	if (document.querySelector('#apply-numeric').checked) {
		if (avg > 100 || avg < 0) {
			alert('Please enter a valid number for the average (min: 0, max: 100)');
			return;
		}

		if (year > 2016 || year < 1900) {
			alert('Please enter a valid number for the year (min: 1900, max 2022)');
			return;
		}
	}

	let whereClause = {
		[logicOption]: [
			{
				[avgComparison]: {
					"sections_avg": avg
				}
			},
			{
				[yearComparison]: {
					"sections_year": year
				}
			}
		]
	};

	if (document.querySelector('#select-all-departments').checked) {
		if (document.querySelector('#apply-numeric').checked) {
			query.WHERE = whereClause;
		}
	} else if (department === '') {
		alert('Please enter a department or select "Select All"');
		return;
	} else {
		if (document.querySelector('#apply-numeric').checked) {
			query.WHERE = {
				"AND": [
					whereClause,
					{
						"IS": {
							"sections_dept": department
						}
					}
				]
			}
		} else {
			query.WHERE = {
				"IS": {
					"sections_dept": department
				}
			}
		}
	}

	let formattedQuery = JSON.stringify(query, null, 2);

	fetch('http://localhost:4321/query', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: formattedQuery
	}).then(response => {
		if (response.ok) {
			alert('Query executed successfully');
			response.json().then(data => {
				displayResult(data.result);
			});
		} else {
			alert('Error executing query');
		}
	}).catch(error => {
		alert('Error executing query:', error);
	});
}

function displayResult(result){
	const tableBody = document.querySelector("#resultTable tbody");
	tableBody.innerHTML = ""; // clear previous contents of the table
	result.forEach((row) => {
		const tr = document.createElement("tr");
		const tdDept = document.createElement("td");
		const tdId = document.createElement("td");
		const tdAvg = document.createElement("td");
		const tdYear = document.createElement("td");
		const tdTitle = document.createElement("td");

		tdDept.innerText = row.sections_dept;
		tdId.innerText = row.sections_id;
		tdAvg.innerText = row.sections_avg;
		tdYear.innerText = row.sections_year;
		tdTitle.innerText = row.sections_title;

		tdDept.style.verticalAlign = "middle";
		tdId.style.verticalAlign = "middle";
		tdAvg.style.verticalAlign = "middle";
		tdYear.style.verticalAlign = "middle";
		tdTitle.style.verticalAlign = "middle";

		tdDept.style.verticalAlign = "middle";
		tdId.style.verticalAlign = "middle";
		tdAvg.style.verticalAlign = "middle";
		tdYear.style.verticalAlign = "middle";

		tr.appendChild(tdDept);
		tr.appendChild(tdId);
		tr.appendChild(tdTitle);
		tr.appendChild(tdAvg);
		tr.appendChild(tdYear);

		tableBody.appendChild(tr);
	});
}


