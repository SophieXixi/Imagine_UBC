import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {Section} from "./CourseHelper";
export class Dataset {
	public sections: Section[];
	public id: string;
	public insightDataset: InsightDataset;
	public kind: InsightDatasetKind;
	constructor(id: string, section: any[], kind: InsightDatasetKind) {
		this.id = id;
		this.sections = section;
		this.kind = kind;
		this.insightDataset = {
			id: this.id,
			kind: this.kind,
			numRows: this.sections.length,
		};
	}
}
