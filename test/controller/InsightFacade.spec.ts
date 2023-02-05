import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let nonzip: string;
	let dup: string;
	let small: string;
	let notjson: string;
	let empty: string;
	let invalidjson: string;
	let wrongfolder: string;
	let novalidsection: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");

		small = getContentFromArchives("courses.zip");
		nonzip = getContentFromArchives("CPSC330.pdf");
		dup = getContentFromArchives("dup.zip");
		notjson = getContentFromArchives("notjson.zip");
		empty = getContentFromArchives("empty.zip");
		invalidjson = getContentFromArchives("invalidjson.zip");
		wrongfolder = getContentFromArchives("wrongfolder.zip");
		novalidsection = getContentFromArchives("novalidsection.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});

		// // This is a unit test. You should create more like this!
		// it ("should reject with  an empty dataset id", function() {
		// 	const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
		// });
		//
		it("should successfully add an dataset", async function () {
			const add = await facade.addDataset("course", sections, InsightDatasetKind.Sections);
			expect(add).to.deep.equal(["course"]);
		});

		// it("should reject with  white space dataset id to add", function () {
		// 	const result = facade.addDataset(" ", sections, InsightDatasetKind.Sections);
		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
		// });
		//
		// it("should reject with underscore after dataset id to add", function () {
		// 	const result = facade.addDataset("ubc_", sections, InsightDatasetKind.Sections);
		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
		// });
		//
		// it("should reject with underscore before dataset id to add", function () {
		// 	const result = facade.addDataset("_ubc", sections, InsightDatasetKind.Sections);
		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
		// });
		//
		// it("should reject with underscore middle dataset id to add", function () {
		// 	const result = facade.addDataset("ubc_ubc", sections, InsightDatasetKind.Sections);
		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
		// });
		//
		// it("should reject with an invalid dataset kind to add", function () {
		// 	const result = facade.addDataset("courses", sections, InsightDatasetKind.Rooms);
		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
		// });

		it("should reject with not zip file", function () {
			// not a zip file
			const result = facade.addDataset("notzip", nonzip, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with duplicate ids to add dataset", async function () {
			try {
				await facade.addDataset("dup", sections, InsightDatasetKind.Sections);
				await facade.addDataset("dup", sections, InsightDatasetKind.Sections);
				expect.fail("should be rejected!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an empty zip file", function () {
			// not a zip file
			const result = facade.addDataset("empty", empty, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with not json file", function () {
			// not a zip file
			const result = facade.addDataset("notjson", notjson, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with invalid json file", function () {
			// not a zip file
			const result = facade.addDataset("invalidjson", invalidjson, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with wrong folder zip", function () {
			// not a zip file
			const result = facade.addDataset("wrongfolder", wrongfolder, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// Remove Dataset Tests
		it("should reject with  an empty dataset id to remove", function () {
			const result = facade.removeDataset("");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with whitespace dataset id to remove", function () {
			const result = facade.removeDataset(" ");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with underscore dataset id to remove", function () {
			const result = facade.removeDataset("ubc_");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject when no dataset been added,nonexit dataset id to remove", function () {
			const result = facade.removeDataset("nonexist");
			return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});
	//
	// 	it("should reject with datasat added but an nonexist dataset id to remove", async function () {
	// 		try{
	// 			await facade.addDataset("removecourse", small, InsightDatasetKind.Sections);
	// 			const result = await facade.removeDataset("nonexist");
	// 			expect.fail("should have been rejected!");
	// 		} catch (err) {
	// 			expect(err).to.be.instanceOf(InsightError);
	// 		}
	// 	});
	//
	// 	it("should successfully remove one added id", async function () {
	// 		// Setup
	// 		await facade.addDataset("removecourse", sections, InsightDatasetKind.Sections);
	// 		// Execution
	// 		const removeid = await facade.removeDataset("removecourse");
	// 		// Validation
	// 		expect(removeid).to.deep.equal("removecourse");
	// 	});
	//
	// 	it("should successfully for combination", async function(){
	// 		await facade.addDataset("add1", small, InsightDatasetKind.Sections);
	// 		await facade.addDataset("add2", small, InsightDatasetKind.Sections);
	// 		await facade.removeDataset("add2");
	// 		const left = await facade.listDatasets();
	// 		expect(left).to.deep.equal([{
	// 			id: "add1",
	// 			kind: InsightDatasetKind.Sections,
	// 			numRows: 2
	// 		}]);
	// 	});
	//
		// List Dataset Tests
		it("should list no dataset when no add", function () {
			const datasets = facade.listDatasets();
			return expect(datasets).to.eventually.deep.equal([]);
		});

		it("should list one dataset", async function () {
			// Setup
			await facade.addDataset("ubc", small, InsightDatasetKind.Sections);
			// Execution
			const datasets = await facade.listDatasets();
			// Validation
			expect(datasets).to.deep.equal([{
				id: "ubc",
				kind: InsightDatasetKind.Sections,
				numRows: 2
			}]);
		});
	//
	// 	// fixxxx
	// 	it("should list several datasets", async function () {
	// 		// Setup
	// 		await facade.addDataset("ubc", small, InsightDatasetKind.Sections);
	// 		await facade.addDataset("ubc2", small, InsightDatasetKind.Sections);
	// 		// Execution
	// 		const datasets = await facade.listDatasets();
	// 		// Validation
	// 		expect(datasets).to.be.an.instanceOf(Array);
	// 		expect(datasets).to.have.length(2);
	// 		const course = datasets.find((dataset) => dataset.id === "ubc");
	// 		expect(course).to.exist;
	// 		expect(course).to.deep.equal({
	// 			id: "ubc",
	// 			kind: InsightDatasetKind.Sections,
	// 			numRows: 2
	// 		});
	// 	});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queries",
			{
				assertOnResult: (actual, expected) => {
					// TODO add an assertion!
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					// TODO add an assertion!
				},
			}
		);
	});
});
