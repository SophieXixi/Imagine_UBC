document.getElementById("search").addEventListener("click", searchQuery);
document.getElementById("upload-button").addEventListener("click", addDataset);

function addDataset() {
	const fileInput = document.querySelector('#zip-file');
	const file = fileInput.files[0];
	alert(`upload zip file: ${file.name}`);

	const xhr = new XMLHttpRequest();
	xhr.open('PUT', 'http://localhost:4321/dataset/sections/sections');
	xhr.onload = function () {
		if (xhr.status === 200) {
			console.log('Dataset added successfully');
		} else {
			console.log('Error adding dataset');
		}
	};
	xhr.send(file);
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

function searchQuery() {
	// Get the search input values
	const department = document.querySelector('#department-input').value;
	const avg = parseFloat(document.querySelector('#avg-input').value);
	const avgComparison = MCOMPARATOR(document.querySelector("#avg-comparison").value);
	const year = parseFloat(document.querySelector('#year-input').value);
	const yearComparison = MCOMPARATOR(document.querySelector('#year-comparison').value);
	const logicOption = LOGIC(document.querySelector('#logic-option').value);
	let query = {
		"WHERE":{
			"AND":[
				{
					[logicOption]:[
						{
							[avgComparison]:{
								"sections_avg":avg
							}
						},
						{
							[yearComparison]:{
								"sections_year":year
							}
						}
					]
				},
				{
					"IS":{
						"sections_dept":"cpsc"
					}
				}
			]
		},
		"OPTIONS":{
			"COLUMNS":[
				"sections_dept",
				"sections_id",
				"sections_avg",
				"sections_year"
			],
			"ORDER":"sections_avg"
		}
	};
	let formattedQuery = JSON.stringify(query, null, 2);

	const xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://localhost:4321/query');
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onload = function () {
		if (xhr.status === 200) {
			console.log('Query executed successfully');
			const response = JSON.parse(xhr.responseText);
			displayResult(response.result); // assuming you have a function called displayResult that generates a table from the response object
		} else {
			console.log('Error executing query');
		}
	};
	xhr.send(formattedQuery);
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

		tdDept.innerText = row.sections_dept;
		tdId.innerText = row.sections_id;
		tdAvg.innerText = row.sections_avg;
		tdYear.innerText = row.sections_year;

		tr.appendChild(tdDept);
		tr.appendChild(tdId);
		tr.appendChild(tdAvg);
		tr.appendChild(tdYear);

		tableBody.appendChild(tr);
	});
}


