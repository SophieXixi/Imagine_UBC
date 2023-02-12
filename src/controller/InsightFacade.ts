import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import JSZip from "jszip";
import {CheckQuery} from "./CheckQuery";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private static datasets: any;
	private static IDs: any;
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}
	public addDataset(ID: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return Promise.reject("not implemented");
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("not implemented");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject(" ");
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
