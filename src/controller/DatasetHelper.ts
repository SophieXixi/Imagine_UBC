import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {Section} from "./CourseHelper";
export class Dataset {
	public sections: Section[];
	public id: string;
	public insightDataset: InsightDataset;
	constructor(id: string, section: any[]) {
		this.id = id;
		this.sections = section;
		this.insightDataset = {
			id: this.id,
			kind: InsightDatasetKind.Sections,
			numRows: this.sections.length,
		};
	}
}
