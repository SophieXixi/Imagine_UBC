import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
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
	let missingfield: string;
	let missingfield2: string;
	let missingfieldall: string;
	let section: string;
	let courses: string;
	let picture: string;
	let inside: string;
	let novalid: string;
	let shouldpass: string;

	// C2 new add
	let indexnotroot: string;
	let campus: string;
	let indexempty: string;
	let notable: string;
	let diffpath: string;
	let onlyindex: string;
	let rootfolder: string;
	let incomp: string;
	let smalltable: string;
	let noroom: string;
	let nophotp: string;
	let missingcode: string;
	let ESB: string;
	let roommissing: string;

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
		section = getContentFromArchives("pair.zip");
		courses = getContentFromArchives("courses.zip");
		picture = getContentFromArchives("image.zip");
		inside = getContentFromArchives("folder-inside.zip");
		novalid = getContentFromArchives("Novalid.zip");
		shouldpass = getContentFromArchives("shouldpass.zip");
		missingfield = getContentFromArchives("missingField1.zip");
		missingfield2 = getContentFromArchives("missingField2.zip");
		missingfieldall = getContentFromArchives("allmissing.zip");

		// C2 new add
		indexnotroot = getContentFromArchives("index_not_root.zip");
		campus = getContentFromArchives("campus.zip");
		indexempty = getContentFromArchives("index empty.zip");
		notable = getContentFromArchives("notable.zip");
		diffpath = getContentFromArchives("diff path.zip");
		onlyindex = getContentFromArchives("only index.zip");
		rootfolder = getContentFromArchives("root folder.zip");
		incomp = getContentFromArchives("incomp htm.zip");
		nophotp = getContentFromArchives("no photo.zip");
		noroom = getContentFromArchives("only index.zip");
		smalltable = getContentFromArchives("small table.zip");
		missingcode = getContentFromArchives("missing code.zip");
		ESB = getContentFromArchives("ESB missing field.zip");
		roommissing = getContentFromArchives("all missing field.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("C2: Add/Remove/List Dataset", function () {
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

		// ID check
		it("should reject with  an empty dataset id", function () {
			const result = facade.addDataset("", sections, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with  white space dataset id to add", function () {
			const result = facade.addDataset(" ", sections, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with long white space dataset id to add", function () {
			const result = facade.addDataset("     ", sections, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with underscore after dataset id to add", function () {
			const result = facade.addDataset("ubc_", sections, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with underscore before dataset id to add", function () {
			const result = facade.addDataset("_ubc", sections, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with underscore middle dataset id to add", function () {
			const result = facade.addDataset("ubc_ubc", sections, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});


		it("should reject with duplicate ids to add dataset", async function () {
			try {
				await facade.addDataset("dup", smalltable, InsightDatasetKind.Rooms);
				await facade.addDataset("dup", smalltable, InsightDatasetKind.Rooms);
				expect.fail("should be rejected!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		// zip check
		it("should reject with not zip file", function () {
			// not a zip file
			const result = facade.addDataset("notzip", nonzip, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an empty zip file", function () {
			// not a zip file
			const result = facade.addDataset("empty", empty, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with not empty zip but no index file", function () {
			// not a zip file
			const result = facade.addDataset("wrongfolder", wrongfolder, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with index file not in root ", function () {
			// not a zip file
			const result = facade.addDataset("indexnotroot", indexnotroot, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with not empty zip but only index file", function () {
			// not a zip file
			const result = facade.addDataset("only index", onlyindex, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with zip with root folder", function () {
			// not a zip file
			const result = facade.addDataset("root folder", rootfolder, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with htm in different path", function () {
			// not a zip file
			const result = facade.addDataset("diff path", diffpath, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with wrong zip file", function () {
			const result = facade.addDataset("empty", small, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should successfully add compus", async function() {
			const result = await facade.addDataset("campus", campus, InsightDatasetKind.Rooms);
			return expect(result).to.deep.equal(["campus"]);
		});

		it("should successfully add incomplete index files", async function() {
			const result = await facade.addDataset("incomp", incomp, InsightDatasetKind.Rooms);
			return expect(result).to.deep.equal(["incomp"]);
		});

		it("should reject with empty index file", function () {
			const result = facade.addDataset("empty", indexempty, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with no table content", function () {
			const result = facade.addDataset("notable", notable, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should successfully add with smaller building table", async function() {
			const result = await facade.addDataset("small", smalltable, InsightDatasetKind.Rooms);
			return expect(result).to.deep.equal(["small"]);
		});

		it("should successfully add even one htm missing filed", async function() {
			const result = await facade.addDataset("missing", ESB, InsightDatasetKind.Rooms);
			return expect(result).to.deep.equal(["missing"]);
		});

		it("should reject with all room missing field table", function () {
			const result = facade.addDataset("empty", roommissing, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with missing field table", function () {
			const result = facade.addDataset("empty", nophotp, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with no room available", function () {
			const result = facade.addDataset("empty", noroom, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with missing code filed", function () {
			const result = facade.addDataset("notable", missingcode, InsightDatasetKind.Rooms);
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

		it("should reject with datasat added but an nonexist dataset id to remove", async function () {
			try {
				await facade.addDataset("removecourse", campus, InsightDatasetKind.Rooms);
				await facade.removeDataset("nonexist");
				expect.fail("should have been rejected!");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		it("should successfully remove one added id", async function () {
				// Setup
			await facade.addDataset("remove", campus, InsightDatasetKind.Rooms);
				// Execution
			const removeid = await facade.removeDataset("remove");
				// Validation
			expect(removeid).to.deep.equal("remove");
		});

		it("should successfully remove the second", async function () {
				// Setup
			await facade.addDataset("add1", campus, InsightDatasetKind.Rooms);
			await facade.addDataset("add2", campus, InsightDatasetKind.Rooms);
				// Execution
			const removeid = await facade.removeDataset("add2");
				// Validation
			expect(removeid).to.deep.equal("add2");
		});

		it("should successfully for combination", async function () {
			await facade.addDataset("add1", campus, InsightDatasetKind.Rooms);
			await facade.addDataset("add2", campus, InsightDatasetKind.Rooms);
			await facade.removeDataset("add2");
			const left = await facade.listDatasets();
			expect(left).to.deep.equal([
				{
					id: "add1",
					kind: InsightDatasetKind.Rooms,
					numRows: 364,
				},
			]);
		});

			// List Dataset Tests
		it("should list no dataset when no add", function () {
			const datasets = facade.listDatasets();
			return expect(datasets).to.eventually.deep.equal([]);
		});

		it("should list one dataset", async function () {
				// Setup
			await facade.addDataset("list", campus, InsightDatasetKind.Rooms);
				// Execution
			const datasets = await facade.listDatasets();
				// Validation
			expect(datasets).to.deep.equal([
				{
					id: "list",
					kind: InsightDatasetKind.Rooms,
					numRows: 364,
				},
			]);
		});

			// fixxxx
		it("should list several datasets", async function () {
				// Setup
			await facade.addDataset("sev1", campus, InsightDatasetKind.Rooms);
			await facade.addDataset("sev2", campus, InsightDatasetKind.Rooms);
				// Execution
			const datasets = await facade.listDatasets();
				// Validation
			expect(datasets).to.be.an.instanceOf(Array);
			expect(datasets).to.have.length(2);
			const course = datasets.find((dataset) => dataset.id === "sev1");
			expect(course).to.exist;
			expect(course).to.deep.equal({
				id: "sev1",
				kind: InsightDatasetKind.Rooms,
				numRows: 364,
			});
		});

		it("crash test", async function () {
			await facade.addDataset("add1", campus, InsightDatasetKind.Rooms);
			const newfacade = new InsightFacade();
			expect(facade).to.deep.equal(newfacade);
			await newfacade.addDataset("add2", campus, InsightDatasetKind.Rooms);
			await newfacade.removeDataset("add1");
			const left = await facade.listDatasets();
			expect(left).to.deep.equal([
				{
					id: "add2",
					kind: InsightDatasetKind.Rooms,
					numRows: 364,
				},
			]);
		});
 	});
// });


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

		// This is a unit test. You should create more like this!
		it("should reject with  an empty dataset id", function () {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should successfully add an dataset", async function () {
			const add = await facade.addDataset("course", small, InsightDatasetKind.Sections);
			expect(add).to.deep.equal(["course"]);
		});

		it("should pass with only one file contains valid sections", async function () {
			const add = await facade.addDataset("course", shouldpass, InsightDatasetKind.Sections);
			expect(add).to.deep.equal(["course"]);
		});

		it("should reject with  white space dataset id to add", function () {
			const result = facade.addDataset(" ", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with long white space dataset id to add", function () {
			const result = facade.addDataset("     ", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with underscore after dataset id to add", function () {
			const result = facade.addDataset("ubc_", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with underscore before dataset id to add", function () {
			const result = facade.addDataset("_ubc", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with underscore middle dataset id to add", function () {
			const result = facade.addDataset("ubc_ubc", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

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

		it("should not reject with missingfield json file, still 1 valid", async function () {
			// not a zip file
			const result = await facade.addDataset("missingfield", missingfield, InsightDatasetKind.Sections);
			expect(result).to.deep.equal(["missingfield"]);
		});

		it("should not reject with missingfield json file, still some valid", async function () {
			// not a zip file
			const result = await facade.addDataset("missing", missingfield2, InsightDatasetKind.Sections);
			expect(result).to.deep.equal(["missing"]);
		});

		it("should reject with all missingfield json file", function () {
			// not a zip file
			const result = facade.addDataset("missingfieldall", missingfieldall, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with wrong folder zip", function () {
			// not a zip file
			const result = facade.addDataset("wrongfolder", wrongfolder, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// success
		it("addDataset should successfully add a dataset one", function () {
			const result = facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.deep.equal(["ubc"]);
		});

		// id-invalid: id is not an id string
		it("addDataset should reject with an invalid id string", function () {
			const result = facade.addDataset("T_T", courses, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// id-invalid: id is only whitespace
		it("addDataset should reject with an empty dataset id", function () {
			const result = facade.addDataset("", courses, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// white space
		it("addDataset should reject with an whitespace dataset id", function () {
			const result = facade.addDataset("      ", courses, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// content-invalid: zip file is not a zip file
		it("addDataset should reject with not an zip file", function () {
			const text = getContentFromArchives("text.txt");
			const result = facade.addDataset("ubc", text, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// content-dataset-invalid: dataset is not in the format of a base64 string
		it("addDataset should reject with file not in the format of base64 string", async function () {
			try {
				await facade.addDataset("ubc", picture, InsightDatasetKind.Sections);
				expect.fail("should reject: dataset is not in the format of a base64 string");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("addDataset should reject with file not in the format of base64 string??", function () {
			const result = facade.addDataset("ubc", picture, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
	});
//
// 		// !!!
// 		// content-dataset-invalid: not under the folder courses
// 		it("addDataset should reject with not under the folder courses", function () {
// 			const notCourse = getContentFromArchives("cpsc.zip");
// 			const result = facade.addDataset("ubc", notCourse, InsightDatasetKind.Sections);
// 			return expect(result).to.eventually.be.rejectedWith(InsightError);
// 		});
//
// 		// content-course-invalid: is not a json formatted file
// 		it("addDataset should reject with not a json format file--picture", async function () {
// 			try {
// 				await facade.addDataset("ubc", picture, InsightDatasetKind.Sections);
// 				expect.fail("should reject: dataset is not a json format file--picture");
// 			} catch (err) {
// 				expect(err).to.be.instanceof(InsightError);
// 			}
// 		});
// 		it("addDataset should reject with not a json format file--text", async function () {
// 			try {
// 				const text = getContentFromArchives("text.txt");
// 				await facade.addDataset("ubc", text, InsightDatasetKind.Sections);
// 				expect.fail("should reject: dataset is not a json format file--text");
// 			} catch (err) {
// 				expect(err).to.be.instanceof(InsightError);
// 			}
// 		});
//
// 		// content-course-invalid: has no valid sections
// 		it("addDataset should reject with no valid section", function () {
// 			const noCourse = getContentFromArchives("noValidCourse.zip");
// 			const result = facade.addDataset("ubc", noCourse, InsightDatasetKind.Sections);
// 			return expect(result).to.eventually.rejectedWith(InsightError);
// 		});
//
// 		// kind-invalid: kind is rooms
// 		it("addDataset should reject with no valid kind", function () {
// 			const result = facade.addDataset("ubc", courses, InsightDatasetKind.Rooms);
// 			return expect(result).to.eventually.rejectedWith(InsightError);
// 		});
//
// 		// add same dataset twice
// 		it("addDataset should reject with already added", function () {
// 			const result = facade
// 				.addDataset("ubc", courses, InsightDatasetKind.Sections)
// 				.then(() => facade.addDataset("ubc", courses, InsightDatasetKind.Sections));
// 			return expect(result).to.eventually.rejectedWith(InsightError);
// 		});
//
// 		// courses folder inside folder
// 		it("addDataset should reject folder inside folder", function () {
// 			const result = facade.addDataset("ubc", inside, InsightDatasetKind.Rooms);
// 			return expect(result).to.eventually.rejectedWith(InsightError);
// 		});
//
// 		// no valid sections
// 		it("addDataset should reject folder inside folder", function () {
// 			const result = facade.addDataset("ubc", novalid, InsightDatasetKind.Rooms);
// 			return expect(result).to.eventually.rejectedWith(InsightError);
// 		});
//
// 			// Remove Dataset Tests
// 		it("should reject with  an empty dataset id to remove", function () {
// 			const result = facade.removeDataset("");
// 			return expect(result).to.eventually.be.rejectedWith(InsightError);
// 		});
//
// 		it("should reject with whitespace dataset id to remove", function () {
// 			const result = facade.removeDataset(" ");
// 			return expect(result).to.eventually.be.rejectedWith(InsightError);
// 		});
//
// 		it("should reject with underscore dataset id to remove", function () {
// 			const result = facade.removeDataset("ubc_");
// 			return expect(result).to.eventually.be.rejectedWith(InsightError);
// 		});
//
// 		it("should reject when no dataset been added,nonexit dataset id to remove", function () {
// 			const result = facade.removeDataset("nonexist");
// 			return expect(result).to.eventually.be.rejectedWith(NotFoundError);
// 		});
//
// 		it("should reject with datasat added but an nonexist dataset id to remove", async function () {
// 			try {
// 				await facade.addDataset("removecourse", small, InsightDatasetKind.Sections);
// 				await facade.removeDataset("nonexist");
// 				expect.fail("should have been rejected!");
// 			} catch (err) {
// 				expect(err).to.be.instanceOf(NotFoundError);
// 			}
// 		});
//
// 		it("should successfully remove one added id", async function () {
// 				// Setup
// 			await facade.addDataset("remove", sections, InsightDatasetKind.Sections);
// 				// Execution
// 			const removeid = await facade.removeDataset("remove");
// 				// Validation
// 			expect(removeid).to.deep.equal("remove");
// 		});
//
// 		it("should successfully remove the second", async function () {
// 				// Setup
// 			await facade.addDataset("add1", small, InsightDatasetKind.Sections);
// 			await facade.addDataset("add2", small, InsightDatasetKind.Sections);
// 				// Execution
// 			const removeid = await facade.removeDataset("add2");
// 				// Validation
// 			expect(removeid).to.deep.equal("add2");
// 		});
//
// 		it("should successfully for combination", async function () {
// 			await facade.addDataset("add1", small, InsightDatasetKind.Sections);
// 			await facade.addDataset("add2", small, InsightDatasetKind.Sections);
// 			await facade.removeDataset("add2");
// 			const left = await facade.listDatasets();
// 			expect(left).to.deep.equal([
// 				{
// 					id: "add1",
// 					kind: InsightDatasetKind.Sections,
// 					numRows: 2,
// 				},
// 			]);
// 		});
//
// 			// List Dataset Tests
// 		it("should list no dataset when no add", function () {
// 			const datasets = facade.listDatasets();
// 			return expect(datasets).to.eventually.deep.equal([]);
// 		});
//
// 		it("should list one dataset", async function () {
// 				// Setup
// 			await facade.addDataset("list", small, InsightDatasetKind.Sections);
// 				// Execution
// 			const datasets = await facade.listDatasets();
// 				// Validation
// 			expect(datasets).to.deep.equal([
// 				{
// 					id: "list",
// 					kind: InsightDatasetKind.Sections,
// 					numRows: 2,
// 				},
// 			]);
// 		});
//
// 			// fixxxx
// 		it("should list several datasets", async function () {
// 				// Setup
// 			await facade.addDataset("sev1", small, InsightDatasetKind.Sections);
// 			await facade.addDataset("sev2", small, InsightDatasetKind.Sections);
// 				// Execution
// 			const datasets = await facade.listDatasets();
// 				// Validation
// 			expect(datasets).to.be.an.instanceOf(Array);
// 			expect(datasets).to.have.length(2);
// 			const course = datasets.find((dataset) => dataset.id === "sev1");
// 			expect(course).to.exist;
// 			expect(course).to.deep.equal({
// 				id: "sev1",
// 				kind: InsightDatasetKind.Sections,
// 				numRows: 2,
// 			});
// 		});
//
// 		it("crash test", async function () {
// 			await facade.addDataset("add1", small, InsightDatasetKind.Sections);
// 			const newfacade = new InsightFacade();
// 			expect(facade).to.deep.equal(newfacade);
// 			await newfacade.addDataset("add2", small, InsightDatasetKind.Sections);
// 			await newfacade.removeDataset("add1");
// 			const left = await facade.listDatasets();
// 			expect(left).to.deep.equal([
// 				{
// 					id: "add2",
// 					kind: InsightDatasetKind.Sections,
// 					numRows: 2,
// 				},
// 			]);
// 		});
// 			// fixxxx
// 		it("should list several datasets", async function () {
// 				// Setup
// 			await facade.addDataset("sev1", small, InsightDatasetKind.Sections);
// 			await facade.addDataset("sev2", small, InsightDatasetKind.Sections);
// 				// Execution
// 			const newfacade = new InsightFacade();
// 			const datasets = await newfacade.listDatasets();
// 				// Validation
// 			expect(datasets).to.be.an.instanceOf(Array);
// 			expect(datasets).to.have.length(2);
// 			const course = datasets.find((dataset) => dataset.id === "sev1");
// 			expect(course).to.exist;
// 			expect(course).to.deep.equal({
// 				id: "sev1",
// 				kind: InsightDatasetKind.Sections,
// 				numRows: 2,
// 			});
// 		});
// 		it("crash list check", async function () {
// 				// Setup
// 			await facade.addDataset("sev1", small, InsightDatasetKind.Sections);
// 			await facade.addDataset("sev2", small, InsightDatasetKind.Sections);
// 				// Execution
// 			const fnew = new InsightFacade();
// 			const datasets = await fnew.listDatasets();
// 				// Validation
// 			expect (fnew).to.deep.equal(facade);
// 			expect(datasets).to.be.an.instanceOf(Array);
// 			expect(datasets).to.have.length(2);
// 			const course = datasets.find((dataset) => dataset.id === "sev1");
// 			expect(course).to.exist;
// 			expect(course).to.deep.equal({
// 				id: "sev1",
// 				kind: InsightDatasetKind.Sections,
// 				numRows: 2,
// 			});
// 		});
//
// 		it("crash add check", async function () {
// 				// Setup
// 			await facade.addDataset("sev1", small, InsightDatasetKind.Sections);
// 				// Execution
// 			const fnew = new InsightFacade();
// 			await fnew.addDataset("sev2", small, InsightDatasetKind.Sections);
// 			const datasets = await fnew.listDatasets();
// 				// Validation
// 			expect(datasets).to.be.an.instanceOf(Array);
// 			expect(datasets).to.have.length(2);
// 			const course = datasets.find((dataset) => dataset.id === "sev1");
// 			expect(course).to.exist;
// 			expect(course).to.deep.equal({
// 				id: "sev1",
// 				kind: InsightDatasetKind.Sections,
// 				numRows: 2,
// 			});
// 		});
//
// 		it("crash remove check", async function () {
// 				// Setup
// 			await facade.addDataset("sev1", small, InsightDatasetKind.Sections);
// 				// Execution
// 			const fnew = new InsightFacade();
// 			await fnew.addDataset("sev2", small, InsightDatasetKind.Sections);
// 			await fnew.addDataset("noneed", small, InsightDatasetKind.Sections);
// 			const fag = new InsightFacade();
// 			await fag.removeDataset("noneed");
// 			const datasets = await fag.listDatasets();
// 				// Validation
// 			expect(datasets).to.be.an.instanceOf(Array);
// 			expect(datasets).to.have.length(2);
// 			const course = datasets.find((dataset) => dataset.id === "sev1");
// 			expect(course).to.exist;
// 			expect(course).to.deep.equal({
// 				id: "sev1",
// 				kind: InsightDatasetKind.Sections,
// 				numRows: 2,
// 			});
// 	});
// });
//
// 	/*
// 	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
// 	 * You should not need to modify it; instead, add additional files to the queries directory.
// 	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
// 	 */
// 	describe("PerformQuery", () => {
//
// 		before(function () {
// 			console.info(`Before: ${this.test?.parent?.title}`);
//
// 			facade = new InsightFacade();
//
// 			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
// 			// Will *fail* if there is a problem reading ANY dataset.
// 			const loadDatasetPromises = [facade.addDataset("sections", sections, InsightDatasetKind.Sections)];
//
// 			return Promise.all(loadDatasetPromises);
// 		});
//
// 		after(function () {
// 			console.info(`After: ${this.test?.parent?.title}`);
// 			clearDisk();
// 		});
//
// 		type Input = unknown;
// 		type Output = Promise<InsightResult[]>;
// 		type Error = "InsightError" | "ResultTooLargeError";
//
// 		function errorValidator(error: any): error is Error {
// 			return error === "InsightError" || error === "ResultTooLargeError";
// 		}
//
// 		function assertOnError(actual: any, expected: Error): void {
// 			if (expected === "InsightError") {
// 				expect(actual).to.be.instanceof(InsightError);
// 			} else if (expected === "ResultTooLargeError") {
// 				expect(actual).to.be.instanceof(ResultTooLargeError);
// 			} else {
// 				expect.fail("there is an unexpected error");
// 			}
// 		}
//
// 		function assertOnResult(actual: unknown, expected: Output): void {
// 			expect(actual).to.deep.equal(expected);
// 		}
//
// 		folderTest<Input, Output, Error>(
// 			"Dynamic InsightFacade PerformQuery tests - simple",
// 			(input) => facade.performQuery(input),
// 			"./test/resources/order",
// 			{
// 				errorValidator,
// 				assertOnError,
// 				assertOnResult
// 			}
// 		);
//
// 	});
//
	describe("PerformQuery", () => {

		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
			facade = new InsightFacade();
		// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
		// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [facade.addDataset("rooms", campus, InsightDatasetKind.Rooms)];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

	type Input = unknown;
	type Output = Promise<InsightResult[]>;
	type Error = "InsightError" | "ResultTooLargeError";

	function errorValidator(error: any): error is Error {
		return error === "InsightError" || error === "ResultTooLargeError";
	}

	function assertOnError(actual: any, expected: Error): void {
		if (expected === "InsightError") {
			expect(actual).to.be.instanceof(InsightError);
		} else if (expected === "ResultTooLargeError") {
			expect(actual).to.be.instanceof(ResultTooLargeError);
		} else {
			expect.fail("there is an unexpected error");
		}
	}
	function assertOnResult(actual: unknown, expected: Output): void {
		expect(actual).to.deep.equal(expected);
	}
	folderTest<Input, Output, Error>(
		"test",
		(input) => facade.performQuery(input),
		"./test/resources/try",
		{
			errorValidator,
			assertOnError,
			assertOnResult
		}
	);
	// folderTest<Input, Output, Error>(
	// 	"invalid-room",
	// 	(input) => facade.performQuery(input),
	// 	"./test/resources/invalid-room",
	// 	{
	// 		errorValidator,
	// 		assertOnError,
	// 		assertOnResult
	// 	}
	// );
	// folderTest<Input, Output, Error>(
	// 	"invalid-section",
	// 	(input) => facade.performQuery(input),
	// 	"./test/resources/invalid-section",
	// 	{
	// 		errorValidator,
	// 		assertOnError,
	// 		assertOnResult
	// 	}
	// );
	folderTest<Input, Output, Error>(
		"success-not full order",
		(input) => facade.performQuery(input),
		"./test/resources/success-not full order",
		{
			errorValidator,
			assertOnError,
			assertOnResult
		}
	);
	// folderTest<Input, Output, Error>(
	// 	"success-room",
	// 	(input) => facade.performQuery(input),
	// 	"./test/resources/success-room",
	// 	{
	// 		errorValidator,
	// 		assertOnError,
	// 		assertOnResult
	// 	}
	// );
	// folderTest<Input, Output, Error>(
	//  "success-section",
	//  (input) => facade.performQuery(input),
	//  "./test/resources/success-section",
	//  {
	//   errorValidator,
	//   assertOnError,
	//   assertOnResult
	//  }
	// );
	});
});
