import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {Section} from "./CourseHelper";
export class Dataset{
	// public id: string;
	// public sections: Section[] = [];
	// public insightDataset: InsightDataset | undefined;
	private static sections: Section[];
	private static insightDataset: InsightDataset | undefined;
	private static id: string;
	constructor(id: string, section: any[]) {
		Dataset.id = id;
		Dataset.sections = section;
	}
	// public addSections(datas: any[]): Section[]{
	// 	for (const data in datas){
	// 		let raredata = JSON.parse(data);
	// 		// process each result in the result list
	// 		for (const result in raredata.result) {
	// 			// each section is formed into section name + content
	// 			const section = new Section(raredata.id, raredata.Course, raredata.Title,
	// 				raredata.Professor, raredata.Subject,
	// 				raredata.Year, raredata.Avg, raredata.Audit, raredata.Pass,
	// 				raredata.Fail);
	// 			Dataset.sections.push(section);
	// 		}
	// 	}
	// 	return Dataset.sections;
	// }
	public static get_insightDataset(dataset: Dataset): InsightDataset{
		let numRows = Dataset.sections.length;
		this.insightDataset = {
			id: this.id,
			kind : InsightDatasetKind.Sections,
			numRows : numRows,
		};
		return this.insightDataset;
	}
}
