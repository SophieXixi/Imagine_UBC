import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError, ResultTooLargeError,
} from "./IInsightFacade";
import JSZip from "jszip";
import {Section} from "./CourseHelper";
import {Dataset} from "./DatasetHelper";
import * as fs from "fs-extra";
import {CheckQuery} from "./CheckQuery";
import {SearchQuery} from "./SearchQuery";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private static datasets: Map<string, Dataset>;
	private static IDs: string[];

	constructor() {
		console.log("InsightFacadeImpl::init()");
		InsightFacade.datasets = new Map<string, Dataset>();
		InsightFacade.IDs = [];
		InsightFacade.checkcrash(InsightFacade.IDs, InsightFacade.datasets);
	}

	public addDataset(ID: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let promises: any[] = [];
		let sections: Section[] = [];
		return new Promise((fulfill, reject) => {
			// * Base Case Invalid ID Tests
			if (InsightFacade.checkValidID(ID, kind)) {
				return reject(new InsightError("Invalid Dataset ID!"));
			}
			let newzip = new JSZip();
			newzip
				.loadAsync(content, {base64: true})
				.then(function (zip) {
					try {
						zip.folder("courses")?.forEach((relativePath: string, file: any) => {
							// access all files in the folder
							promises.push(file.async("text"));
						});
						// **check dataset size, reject empty dataset/wrong folder name
						if (promises.length === 0) {
							return reject(new InsightError("Empty dataset! Reject!"));
						}
					} catch {
						/* empty */
					}
					Promise.all(promises)
						.then((results) => {
							for (const data of results) {
								try {
									InsightFacade.parse(data, sections);
								} catch {
									return reject(new InsightError("Not able to parse, Invalid JSON file/not JSON!"));
								}
							}
							if (sections.length === 0) {
								return reject(new Error("No valid section! Bad Dataset"));
							}
							let dataset = new Dataset(ID, sections);
							const re = InsightFacade.store(ID, dataset);
							return fulfill(re);
						})
						.catch((err) => {
							// * not a zip file, reject
							return reject(err);
						});
				})
				.catch(() => {
					// **not a zip file, reject
					return reject(new InsightError("Not a zip file, failed to load!"));
				});
		});
	}

	public removeDataset(id: string): Promise<string> {
		return new Promise((fulfill, reject) => {
			if (id === "" || id === " " || id.includes("_")) {
				return reject(new InsightError("Invalid Dataset ID!"));
			}
			if (!InsightFacade.IDs.includes(id)) {
				return reject(new NotFoundError("Non-exist Dateset ID!"));
			}
			// delete id from id-list
			delete InsightFacade.IDs[InsightFacade.IDs.indexOf(id)];
			// delete from dataset
			fs.unlinkSync("./data/" + id + ".json");
			InsightFacade.datasets.delete(id);
			const index = InsightFacade.IDs.indexOf(id, 0);
			if (index > -1) {
				InsightFacade.IDs.splice(index, 1);
			}
			return fulfill(id);
		});
	}

	public performQuery(que: unknown): Promise<InsightResult[]> {
		let query: CheckQuery;
		query = new CheckQuery();
		// determine if a query is a valid query
		if (que === null) {
			return Promise.reject(new InsightError("no input"));
		} else if (query.checkQuery(que)) {
			return Promise.reject(new InsightError("invalid query"));
		} else if (!(InsightFacade.IDs.includes(query.getDataset()))) {
			return Promise.reject(new InsightError("not valid dataset"));
		} else {
			// search
			let search: SearchQuery;
			let quer: any = que;
			search = new SearchQuery(quer.WHERE, InsightFacade.datasets.get(query.getDataset()));
			let result: Section[] = search.searchQuery();
			if (result.length >= 5000) {
				return Promise.reject(new ResultTooLargeError("over 5000"));
			} else {
				return Promise.resolve(this.displayQuery(result, quer, query.getDataset()));
			}
		}
	}

	private displayQuery(secs: Section[], query: any, id: string): Promise<InsightResult[]> {
		let keys = Object.keys(query.OPTIONS.COLUMNS);
		let arr = [];
		for (const sec of secs) {
			arr.push(this.displaySection(sec, keys, id));
		}
		return Promise.resolve(arr);
	}
	private displaySection(sec: Section, keys: string[], id: string): InsightResult {
		let obj = Object.create(null);
		for(const key of keys) {
			if (key === id.concat("_uuid")) {
				obj[key] = sec.uuid;
			} else if (key === id.concat("_year")) {
				obj[key] = sec.year;
			} else if (key === id.concat("_dept")) {
				obj[key] = sec.dept;
			} else if (key === id.concat("_id")) {
				obj[key] = sec.id;
			} else if (key === id.concat("_title")) {
				obj[key] = sec.title;
			} else if (key === id.concat("_instructor")) {
				obj[key] = sec.instructor;
			} else if (key === id.concat("_avg")) {
				obj[key] = sec.avg;
			} else if (key === id.concat("_pass")) {
				obj[key] = sec.pass;
			} else if (key === id.concat("_fail")) {
				obj[key] = sec.fail;
			} else {
				obj[key] = sec.audit;
			}
		}
		return obj;
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let results: InsightDataset[] = [];
		return new Promise((fulfill) => {
			InsightFacade.datasets.forEach(function (value: Dataset) {
				let result = value.insightDataset;
				results.push(result);
			});
			return fulfill(results);
		});
	}

	private static store(ID: string, dataset: Dataset): string[] {
		fs.ensureDirSync("./data");
		const json = JSON.stringify(dataset);
		fs.writeFileSync("./data/" + dataset.id + ".json", json);
		this.datasets.set(ID, dataset);
		this.IDs.push(ID);
		return this.IDs;
	}

	private static parse(data: Awaited<any>, sections: Section[]) {
		let parse = JSON.parse(data);
		for (const result of parse.result) {
			// each section is formed into section name + content
			const sec = new Section(
				result.id,
				result.Course,
				result.Title,
				result.Professor,
				result.Subject,
				result.Year,
				result.Avg,
				result.Audit,
				result.Pass,
				result.Fail
			);
			sections.push(sec);
		}
	}

	private static checkValidID(ID: string, kind: InsightDatasetKind): boolean {
		return (
			ID === "" ||
			ID === " " ||
			ID.includes("_") ||
			InsightFacade.IDs.includes(ID) ||
			fs.existsSync("./data/" + ID + ".json") ||
			kind !== InsightDatasetKind.Sections
		);
	}

	private static checkcrash(IDs: string[], datasets: Map<string, Dataset>) {
		const dir = "./data";
		if (fs.existsSync(dir)) {
			// old datasets already exist
			fs.readdirSync(dir).forEach((file) => {
				const id = file.substring(0, file.lastIndexOf(".")) || file;
				if (!IDs.includes(id)) {
					IDs.push(id);
				}
				if (!datasets.has(id)) {
					const obj = fs.readJsonSync("./data/" + id + ".json");
					const dataset = new Dataset(id, obj.sections);
					datasets.set(id, dataset);
				}
			});
		}
	}
}
