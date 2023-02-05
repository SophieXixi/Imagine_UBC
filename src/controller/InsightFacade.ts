import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import JSZip from "jszip";
import "fs";
import * as fs from "fs";
import {Course, Section} from "./CourseHelper";
import {rejects} from "assert";
import {Dataset} from "./DatasetHelper";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private datasets: Map<string, Dataset>;
	private IDs: string[] = [];
	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.datasets = new Map<string, Dataset>();
	}
	public addDataset(ID: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let promises: any[] = [];
		let dataset: Dataset;
		let sections: Section[];
		return new Promise((fulfill, reject) => {
			if(ID === ("" || " ") || ID.includes("_") || this.IDs.includes(ID) || kind !== InsightDatasetKind.Sections){
				return reject(new InsightError("Invalid Dataset ID!"));
			}
			let newzip = new JSZip();
			newzip.loadAsync(content, {base64: true})
				.then(function (zip) {
					try {
						if (Object.keys(zip.files)[0] !== "courses/") {
							// **check folder name, reject not courses folder
							return reject(new InsightError("Folder name invalid! Reject"));
						}
						zip.folder("courses")?.forEach(function (relativePath: string, file: any) {
							// access all files in the folder
							promises.push(file.async("data").then(function (data: any) {
								try {
									let raredata = JSON.parse(data);
									// process each result in the result list
									for (const result of raredata.result) {
										// each section is formed into section name + content
										try {
											// const section = new Section(result.id, result.Course, result.Title,
											// 	result.Professor, result.Subject,
											// 	result.Year, result.Avg, result.Audit, result.Pass,
											// 	result.Fail);
											// sections.push(section);
										} catch {
											return reject(new Error("no"));
										}
									}
								} catch {
									return reject(new Error("no"));
								}
							}));
						});
						// **check dataset size, reject empty dataset
						if (promises.length === 0) {
							return reject(new InsightError("Empty dataset! Reject!"));
						}
						Promise.all(promises).then(function (data) {
							if (sections.length === 0) {
								return reject(new Error("No valid section! Bad Dataset"));
							}
							dataset = new Dataset(ID,sections);
						}).catch((err) => {
							// **not a zip file, reject
							return reject(new Error("Do not expect but ERROR!"));
						});
					} catch {
						return reject(new Error("?? Reject!"));
					}
				}).then(()=>{
					// this.datasets.set(ID,dataset);
					// this.IDs.push(ID);
					// return fulfill(this.IDs);
				}).catch((err) => {
				    // **not a zip file, reject
					return reject(new InsightError("Not a zip file, failed to load!"));
				});
		 });
	}


	public removeDataset(id: string): Promise<string> {
		const path = "";
		return new Promise((fulfill, reject) => {
			if (id === "" || id === " " || id.includes("_")) {
				return reject(new InsightError("Invalid Dataset ID!"));
			}
			if(!this.IDs.includes(id)){
				return reject(new NotFoundError("Non-exist Dateset ID!"));
			}
			// delete id from id-list
			delete this.IDs[this.IDs.indexOf(id)];
			// delete from dataset
			this.datasets.delete(id);
			fs.unlink(path, ((err) => {
				if (err) {
					return reject("reject delete dataset, not expected!");
				} else {
					return fulfill(id);
				}
			}));
		});
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let results: InsightDataset[] = [];
		return new Promise((fulfill) => {
			for (const d of this.datasets){
				let result: InsightDataset | undefined;
				let [name,dataset] = d;
				result = Dataset.get_insightDataset(dataset);
				if (result) {
					results.push(result);
				}
			}
			return fulfill(results);
		});
	}
}
