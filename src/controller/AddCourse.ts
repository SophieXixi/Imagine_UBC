import InsightFacade from "./InsightFacade";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import JSZip from "jszip";
import {Dataset} from "./DatasetHelper";
import {Section} from "./CourseHelper";

export class AddCourse{
	public facade: InsightFacade;

	constructor(insightfacde: InsightFacade) {
		this.facade = insightfacde;
	}

	public addCourse(ID: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise((fulfill, reject) => {
			let promises: any[] = [];
			let sections: Section[] = [];
			let newzip = new JSZip();
			newzip
				.loadAsync(content, {base64: true})
				.then(function (zip) {
					try {
						zip.folder("courses")?.forEach((relativePath: string, file: any) => {
							promises.push(file.async("text"));
						});
						if (promises.length === 0) {
							return reject(new InsightError("Empty dataset! Reject!"));
						}
					} catch {
						return reject(new InsightError("Cannot open folder! Reject!"));
					}
					Promise.all(promises)
						.then((results) => {
							AddCourse.eachfile(results, sections);
						}).then(() => {
							if (sections.length === 0) {
								return reject(new InsightError("No valid section! Bad Dataset"));
							}
							let dataset = new Dataset(ID, sections, InsightDatasetKind.Sections);
							const re = InsightFacade.store(ID, dataset);
							return fulfill(re);
						})
						.catch((err) => {
							return reject(err);
						});
				})
				.catch(() => {
					return reject(new InsightError("Not a zip file, failed to load!"));
				});
		});
	}

	private static eachfile(results: any[], sections: Section[]) {
		for (const data of results) {
			try {
				let parse = JSON.parse(data);
				for (const result of parse.result) {
					if (
						result.id === undefined ||
						result.Course === undefined ||
						result.Title === undefined ||
						result.Professor === undefined ||
						result.Subject === undefined ||
						result.Section === undefined ||
						result.Avg === undefined ||
						result.Audit === undefined ||
						result.Pass === undefined ||
						result.Fail === undefined
					) {
						console.log("missingfiled");
					} else {
						let yr: number = 0;
						if (result.Section === "overall") {
							yr = 1900;
						} else {
							yr = +result.Year;
						}
						// each section is formed into section name + content
						const sec = new Section(
							result.id.toString(),
							result.Course,
							result.Title,
							result.Professor,
							result.Subject,
							yr,
							result.Avg,
							result.Audit,
							result.Pass,
							result.Fail
						);
						sections.push(sec);
					}
				}
			} catch {
				//
			}
		}
	}
}
