import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {Section} from "./CourseHelper";
import {Room} from "./RoomHelper";

export class Dataset {
	public sections: Section[] = [];
	public rooms: Room[] = [];
	public id: string;
	public insightDataset: InsightDataset;
	public kind: InsightDatasetKind;
	constructor(id: string, dataset: any[], kind: InsightDatasetKind) {
		this.id = id;
		this.kind = kind;
		this.insightDataset = {
			id: this.id,
			kind: this.kind,
			numRows: dataset.length,
		};
		this.getDataset(dataset);
	}


	private getDataset(dataset: any[]) {
		if (this.kind === InsightDatasetKind.Sections){
			this.sections = dataset;
		}
		if (this.kind === InsightDatasetKind.Rooms){
			this.rooms = dataset;
		}
	}
}
