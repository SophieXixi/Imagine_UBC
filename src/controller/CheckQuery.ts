import {InsightError, InsightResult} from "./IInsightFacade";
import {rejects} from "assert";

export class CheckQuery {
	private dataset: string;
	private ids: string[];
	constructor(ids: string[]) {
		this.dataset = "";
		this.ids = ids;
	}
	public getDataset(): string {
		return this.dataset;
	}
	/* if query is invalid, return 1;
	   if query is valid, return 0;
	 */
	public checkQuery(que: unknown): Promise<any> {
		return new Promise((resolve, reject) => {
			if (que === null) {
				return reject(new InsightError("invalid"));
			}
			// check type
			if (typeof que !== "object") {
				return reject(new InsightError("invalid"));
			}
			// console.log("before where");
			let query: any = que as any;
			// check where
			if (query.WHERE !== null) {
				// console.log("query-where");
				if (typeof query.WHERE !== "object" || Array.isArray(query.WHERE)) {
					// console.log("query-where-type");
					return reject(new InsightError("invalid"));
				}
				let arr;
				arr = Object.keys(query.WHERE);
				for (const item of arr) {
					let res: number;
					res = this.checkFilter(item, query.WHERE);
					if (res === 1) {
						return reject(new InsightError("invalid"));
					}
				}
			}
			// check options
			if (!query.OPTIONS || typeof query.OPTIONS !== "object") {
				return reject(new InsightError("invalid"));
			} else {
				let array;
				array = Object.keys(query.OPTIONS);
				if (!array.includes("COLUMNS")) {
					// console.log("query-options-column");
					return reject(new InsightError("invalid"));
				} else {
					let res = this.checkColumn(query.OPTIONS.COLUMNS);
					if (res === 1) {
						return reject(new InsightError("invalid"));
					}
				}
				if (array.includes("ORDER")) {
					let res: number = this.checkOrder(query.OPTIONS);
					if (res === 1) {
						return reject(new InsightError("invalid"));
					}
				}
			}
			return resolve(" ");
		});
	}

	private checkFilter(item: string, obj: any): number {
		let res: number;
		if (item === "OR") {
			// console.log("or:");
			res = this.checkQueryOrAnd(obj.OR);
			// console.log("or-result");
			// console.log(res);
		} else if (item === "AND") {
			// console.log("and:");
			res = this.checkQueryOrAnd(obj.AND);
			// console.log("and-result");
			// console.log(res);
		} else if (item === "GT") {
			res = this.checkQueryGtLtEq(obj.GT);
			// console.log("gt-result");
			// console.log(res);
		} else if (item === "LT") {
			// console.log("lt:");
			res = this.checkQueryGtLtEq(obj.LT);
			// console.log("lt-result");
			// console.log(res);
		} else if (item === "EQ") {
			res = this.checkQueryGtLtEq(obj.EQ);
			// console.log("eq-result");
			// console.log(res);
		} else if (item === "IS") {
			res = this.checkQueryIs(obj.IS);
			// console.log("is-result");
			// console.log(res);
		} else if (item === "NOT") {
			// console.log("not");
			res = this.checkQueryNot(obj.NOT);
			// console.log("not-result");
			// console.log(res);
		} else {
			res = 0;
		}
		return res;
	}
	private checkQueryOrAnd(arr: any): number {
		if (!(Array.isArray(arr))) {
			// console.log("or-array");
			return 1;
		} else if (arr.length === 0) {
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
	private checkQueryNot(obj: any): number {
		// console.log(obj);
		if (typeof obj !== "object") {
			return 1;
		} else {
			let arr;
			arr = Object.keys(obj);
			if (arr.length !== 1) {
				return 1;
			} else {
				// console.log(obj.NOT);
				return this.checkFilter(arr[0], obj);
			}
		}
	}
	private checkQueryGtLtEq(obj: any): number {
		// console.log("gtlteq");
		if (typeof obj !== "object") {
			// console.log("lt-object");
			return 1;
		} else {
			let arr;
			arr = Object.keys(obj);
			// console.log("lt-else");
			if (arr.length !== 1) {
				console.log("lt-length");
				return 1;
			} else {
				// console.log("lt-else-else");
				if (this.checkKey(arr[0], "m")) {
					// console.log("lt-key");
					return 1;
				} else if (typeof obj[arr[0]] !== "number") {
					// console.log("lt-arr");
					// console.log(obj[arr[0]]);
					return 1;
				} else {
					return 0;
				}
			}
		}
	}
	private checkQueryIs(obj: any): number {
		if (typeof obj !== "object") {
			// console.log("is-object");
			return 1;
		} else {
			let arr;
			arr = Object.keys(obj);
			if (arr.length !== 1) {
				return 1;
			} else {
				if (this.checkKey(arr[0], "s")) {
					// console.log("is-key");
					return 1;
				} else if (typeof obj[arr[0]] !== "string") {
					// console.log("is-arr");
					// console.log(obj[arr[0]]);
					return 1;
				}
				if (obj[arr[0]].includes("*")) {
					if (obj[arr[0]].length > 2) {
						if ((obj[arr[0]].substring(1, obj[arr[0]].length - 1)).includes("*")) {
							// console.log("is-include*");
							return 1;
						}
					}
				}
			}
			return 0;
		}
	}
	private checkKey(str: string, type: string): number {
		let div: number;
		div = str.search("_");
		if (div === 0) {
			// console.log("key-0");
			return 1;
		}
		// check dataset
		if (this.dataset === "") {
			this.dataset = str.substring(0, div);
		} else if (this.dataset !== str.substring(0, div)) {
			// console.log("key-dataset");
			return 1;
		} else if (!(this.ids.includes(this.dataset))) {
			return 1;
		}
		// check field
		let field: string;
		field = str.substring(div + 1);
		if (type.includes("s")) {
			if (field === "dept" || field === "id" || field === "uuid" ||
				field === "instructor" || field === "title") {
				return 0;
			}
		}
		if (type.includes("m")) {
			// console.log("key-m");
			// console.log(field);
			if (field === "avg" || field === "pass" || field === "fail" ||
				field === "audit" || field === "year") {
				// console.log("key-m-if");
				return 0;
			}
		}
		return 1;
	}
	private checkColumn(arr: any): number {
		if (!Array.isArray(arr)) {
			return 1;
		} else if (arr.length === 0) {
			return 1;
		} else {
			for (const field of arr) {
				if (typeof field !== "string") {
					return 1;
				} else if (this.checkKey(field, "sm")) {
					return 1;
				}
			}
			return 0;
		}
	}
	private checkOrder(obj: any): number {
		if (typeof obj.ORDER !== "string") {
			return 1;
		} else {
			if (!(obj.COLUMNS.includes(obj.ORDER))) {
				return 1;
			} else {
				return 0;
			}
		}
	}
}
