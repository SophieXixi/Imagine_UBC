import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import {Dataset} from "./DatasetHelper";
import {Section} from "./CourseHelper";
import JSZip from "jszip";
import {CheckQuery} from "./CheckQuery";

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
	}
	public addDataset(ID: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let promises: any[] = [];
		let dataset: Dataset;
		let sections: Section[] = [];
		return new Promise((fulfill, reject) => {
			// * Base Case Invalid ID Tests
			if(ID === "" || ID === " " || ID.includes("_") || InsightFacade.IDs.includes(ID)
				|| kind !== InsightDatasetKind.Sections){
				return reject(new InsightError("Invalid Dataset ID!"));
			}
			let newzip = new JSZip();
			newzip.loadAsync(content, {base64: true})
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
					} catch { /* empty */ }
					Promise.all(promises).then((results) => {
						for (const data of results){
							try{
								let parse = JSON.parse(data);
								for (const result of parse.result) {
									// each section is formed into section name + content
									const sec = new Section(result.id, result.Course, result.Title, result.Professor,
										result.Subject,result.Year, result.Avg, result.Audit, result.Pass, result.Fail);
									sections.push(sec);
								}
							} catch {
								return reject(new InsightError("Not able to parse, Invalid JSON file/not JSON!"));
							}
						}
						if (sections.length === 0) {
							return reject(new Error("No valid section! Bad Dataset"));
						}
						dataset = new Dataset(ID, sections);
						const re = InsightFacade.store(ID,dataset);
						return fulfill(re);
					}).catch((err) => {
						// * not a zip file, reject
						return reject(err);
					});
				}).catch(() => {
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
			if(!InsightFacade.IDs.includes(id)){
				return reject(new NotFoundError("Non-exist Dateset ID!"));
			}
			// delete id from id-list
			delete InsightFacade.IDs[InsightFacade.IDs.indexOf(id)];
			// delete from dataset
			InsightFacade.datasets.delete(id);
			const index = InsightFacade.IDs.indexOf(id,0);
			if (index > -1) {
				InsightFacade.IDs.splice(index, 1);
			}
			return fulfill(id);
			// fs.unlink(path, ((err) => {
			// 	if (err) {
			// 		return reject("reject delete dataset, not expected!");
			// 	} else {
			// 		return fulfill(id);
			// 	}
			// }));
		});
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

	private static store(ID: string, dataset: Dataset) {
		this.datasets.set(ID,dataset);
		this.IDs.push(ID);
		return this.IDs;
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
			// let search: SearchQuery;
			// let quer: any = que;
			// search = new SearchQuery(quer.WHERE, InsightFacade.datasets.get(query.getDataset()));
			return Promise.reject("true");
		}
	}
}
