import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {


	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return Promise.resolve([]);
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		// determine if a query is a valid query
		if (query === null) {
			return Promise.reject(new InsightError("no input"));
		} else if (this.checkQuery(query)) {
			return Promise.reject(new InsightError("invalid query"));
		} else {
			// search

			return Promise.reject("true");
		}
	}

	/* if query is invalid, return 1;
	   if query is valid, return 0;
	 */
	private checkQuery(que: unknown): number {
		// check type
		if (typeof que !== "object") {
			return 1;
		}
		let query: any = que as any;
		// check where
		if (query.WHERE !== null) {
			// check where type
			if (typeof query.WHERE !== "object" || Array.isArray(query.WHERE)) {
				return 1;
			}
			// preparation for iteration
			let arr;
			arr = Object.keys(query.WHERE);
			for (const item of arr) {
				let result: number;
				result = this.checkFilter(item, query.WHERE);
				if (result === 1) {
					return 1;
				}
			}
		}
		// check options
		if (query.OPTIONS) {
			if (typeof query.OPTIONS !== "object") {
				return 1;
			} else {
				let array;
				array = Object.keys(query.OPTIONS);
				if (!array.includes("COLUMNS")) {
					return 1;
				} else {
					let res;
					res = this.checkColumn(query.OPTIONS.COLUMNS);
					if (res === 1) {
						return 1;
					}
				}
				if (array.includes("ORDER")) {
					let res: number;
					res = this.checkOrder(query.OPTIONS);
					return res;
				}
			}
		}
		return 0;
	}

	private checkFilter(item: string, obj: any): number {
		let res: number;
		if (item === "OR") {
			res = this.checkQueryOrAnd(obj.OR);
		} else if (item === "AND") {
			res = this.checkQueryOrAnd(obj.AND);
		} else if (item === "GT") {
			res = this.checkQueryGtLtEq(obj.GT);
		} else if (item === "LT") {
			res = this.checkQueryGtLtEq(obj.LT);
		} else {
			res = this.checkQueryGtLtEq(obj.EQ);
		}
		return res;
	}

	// check dataset
	private checkQueryGtLtEq(obj: any): number {
		if (typeof obj !== "object") {
			return 1;
		} else {
			let arr;
			arr = Object.keys(obj);
			if (arr.length !== 1) {
				return 1;
			} else {
				if (!(arr[0].includes("_avg") || arr[0].includes("_pass") ||
					arr[0].includes("_fail") || arr[0].includes("_audit") || arr[0].includes("_year"))) {
					return 1;
				} else {
					if (typeof obj.arr !== "number") {
						return 1;
					}
				}
			}
		}
		return 0;
	}

	private checkQueryOrAnd(arr: any): number {
		if (Array.isArray(arr)) {
			return 1;
		} else {
			for (const obj of arr) {
				let array;
				array = Object.keys(obj);
				for (const key of array) {
					let result: number;
					result = this.checkFilter(key, obj);
					if (result === 1) {
						return 1;
					}
				}
			}
			return 0;
		}
	}

	// check dataset
	private checkColumn(arr: any): number {
		let mfield = ["avg", "pass", "fail", "audit", "year"];
		let sfield = ["dept", "id", "instructor", "title"];
		if (!Array.isArray(arr)) {
			return 1;
		} else if (arr.length === 0) {
			return 1;
		} else {
			for (const field of arr) {
				let div: number;
				div = field.search("_");
				// no dataset included
				if (div === 0) {
					return 1;
				} else {
					let dataset: string = field.substring(0, div);
					// !!!
					// check dataset
					let name: string = field.substring(div + 1);
					if (!(mfield.includes(name) || sfield.includes(name))) {
						return 1;
					}
				}
			}
			return 0;
		}
	}

	private checkOrder(obj: any): number {
		if (typeof obj.ORDER !== "string") {
			return 1;
		} else {
			return obj.COLUMNS.includes(obj.ORDER);
		}
	}
}
