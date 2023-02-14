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
		return new Promise((resolve, reject) => {
 			let query: CheckQuery;
			query = new CheckQuery(InsightFacade.IDs);
			let quer: any = que;
			let search: SearchQuery;
			query.checkQuery(que).then(() => {
				search = new SearchQuery(quer.WHERE, InsightFacade.datasets.get(query.getDataset()));
				return search.searchQuery();
			}).then((sec) => {
				// console.log(sec);
				return resolve(this.displayQuery(sec, quer, query.getDataset()));
			}).catch((err) => {
				return reject(err);
			});
		});
	}

	private displayQuery(secs: Section[], query: any, id: string): InsightResult[] {
		let arr: any[] = [];
		let result = this.displaySections(secs, query, id, arr);
		// console.log("here");
		// console.log(query);
		// console.log(query.OPTIONS);
		let res = this.displayOrder(result, query.OPTIONS);
		return res;
	}
	private displaySections(secs: Section[], query: any, id: string, arr: any[]): InsightResult[] {
		let keys = query.OPTIONS.COLUMNS;
		for (const sec of secs) {
			let obj = this.displaySection(sec, keys, id);
			// console.log(obj);
			arr.push(obj);
		}
		return arr;
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
				obj[id.concat("_avg")] = sec.avg;
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

	private displayOrder(secs: any[], obj: any): InsightResult[] {
		// console.log("order");
		// console.log(obj);
		if (obj["ORDER"] === null) {
			return secs;
		} else {
			for (let i = 0; i < secs.length; i++) {
				let min = this.findMin(secs, i, obj.ORDER);
				let s = secs[i];
				secs[i] = secs[min];
				secs[min] = s;
			}
			return secs;
		}
	}
	private findMin(secs: any[], i: number, str: string): number {
		let j = i;
		let min: number = i;
		while (j !== secs.length) {
			if (typeof secs[j][str] === "string") {
				if (secs[j][str].localeCompare(secs[min][str]) <= 0) {
					min = j;
				}
			} else {
				if (secs[j][str] <= secs[min][str]) {
					min = j;
				}
			}
			j++;
		}
		return min;
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
			if (result.Section === "overall"){
				const sec = new Section(
					result.id,
					result.Course,
					result.Title,
					result.Professor,
					result.Subject,
					1900,
					result.Avg,
					result.Audit,
					result.Pass,
					result.Fail
				);
				sections.push(sec);
			} else {
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
			if (result.Section === "overall"){
				const sec = new Section(
					result.id,
					result.Course,
					result.Title,
					result.Professor,
					result.Subject,
					1900,
					result.Avg,
					result.Audit,
					result.Pass,
					result.Fail
				);
				sections.push(sec);
			} else {
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
