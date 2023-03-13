import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import {Section} from "./CourseHelper";
import {Dataset} from "./DatasetHelper";
import * as fs from "fs-extra";
import {SearchRoom} from "./SearchRoom";
import {AddCourse} from "./AddCourse";
import {AddRoom} from "./AddRoom";
import {CheckRoom} from "./CheckRoom";
import {Display} from "./Display";
import {CheckSection} from "./CheckSection";
import {SearchSection} from "./SearchSection";
/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private static datasets: Map<string, Dataset>;
	private static IDs: string[];

	constructor() {
		// console.log("InsightFacadeImpl::init()");
		InsightFacade.datasets = new Map<string, Dataset>();
		InsightFacade.IDs = [];
		InsightFacade.checkcrash(InsightFacade.IDs, InsightFacade.datasets);
	}

	public addDataset(ID: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise((fulfill, reject) => {
			if (InsightFacade.checkValidID(ID)) {
				return reject(new InsightError("Invalid Dataset ID!"));
			}

			if (kind === InsightDatasetKind.Sections){
				let courses = new AddCourse(this);
				courses.addCourse(ID, content, kind).then((r)  =>{
					return fulfill(r);
				}).catch((e: any) => {
					return reject(e);
				});
			} else {
				let rooms = new AddRoom(this);
				rooms.addRoom(ID, content, kind).then((r)  =>{
					return fulfill(r);
				}).catch((e: any) => {
					return reject(e);
				});
			}
		});
	}

	public removeDataset(id: string): Promise<string> {
		return new Promise((fulfill, reject) => {
			if (id === "" || !id.trim() || id.includes("_")) {
				return reject(new InsightError("Invalid Dataset ID!"));
			}
			if (!InsightFacade.IDs.includes(id)) {
				return reject(new NotFoundError("Non-exist Dateset ID!"));
			}
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
			let query = new CheckSection(InsightFacade.IDs);
			let quer: any = que;
			let search;
			let display: Display;
			query.checkSection(que)
				.then(() => {
					search = new SearchSection(quer.WHERE, InsightFacade.datasets.get(query.getDataset()));
					return search.searchQuery();
				})
				.then((sec) => {
					// console.log(sec);
					display = new Display(sec, query, query.getDataset());
					return resolve(display.displayQuery());
				})
				.catch(() => {
					let qu = new CheckRoom(InsightFacade.IDs);
					qu.checkRoom(que)
						.then(() => {
							search = new SearchRoom(quer.WHERE, InsightFacade.datasets.get(qu.getDataset()));
							return search.searchRoom();
						})
						.then((sec) => {
							display = new Display(sec, quer, qu.getDataset());
							return resolve(display.displayQuery());
						})
						.catch((err) => {
							return reject(err);
						});
				});
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

	public static store(ID: string, dataset: Dataset): string[] {
		fs.ensureDirSync("./data");
		const json = JSON.stringify(dataset);
		fs.writeFileSync("./data/" + dataset.id + ".json", json);
		this.datasets.set(ID, dataset);
		this.IDs.push(ID);
		return this.IDs;
	}

	private static checkValidID(ID: string): boolean {
		return (
			// empty string case
			ID === null ||
			ID === undefined ||
			!ID.trim() ||
			ID.includes("_") ||
			InsightFacade.IDs.includes(ID) ||
			fs.existsSync("./data/" + ID + ".json")
			// C2
			// kind !== InsightDatasetKind.Sections
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
					const sections: Section[] = [];
					for (const sec of obj.sections) {
						const section = new Section(
							sec.uuid,
							sec.id,
							sec.title,
							sec.instructor,
							sec.dept,
							sec.year,
							sec.avg,
							sec.pass,
							sec.fail,
							sec.audit
						);
						sections.push(section);
					}
					const dataset = new Dataset(id, sections, InsightDatasetKind.Sections);
					datasets.set(id, dataset);
				}
			});
		}
	}
}


