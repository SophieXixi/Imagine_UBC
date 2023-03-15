import {InsightError} from "./IInsightFacade";
export class CheckRoom {
	private dataset: string;
	private ids: string[];
	private columns: string[];
	constructor(ids: string[]) {
		this.dataset = "";
		this.ids = ids;
		this.columns = [];
	}

	public getDataset(): string {
		return this.dataset;
	}

	public checkRoom(que: unknown): Promise<any> {
		return new Promise((resolve, reject) => {
			if (que === null || typeof que !== "object") {
				return reject(new InsightError("invalid"));
			}
			let query: any = que as any;
			if (this.checkWhere(query)) {
				return reject(new InsightError("invalid"));
			}else if (query.TRANSFORMATIONS) {
				if (this.checkTransformation(query)) {
					return reject(new InsightError("invalid"));
				}
			} else {
				for (const str of ["fullname", "shortname", "number", "name", "address",
					"lat", "lon", "seats", "type", "furniture", "href"]) {
					this.columns.push(this.dataset.concat("_", str));
				}
				if (this.checkOption(query)) {
					return reject(new InsightError("invalid"));
				}
			}
			return resolve(" ");
		});
	}

	private checkWhere(query: any): number {
		if (query.WHERE !== null) {
			if (typeof query.WHERE !== "object" || Array.isArray(query.WHERE)) {
				return 1;
			}
			let arr = Object.keys(query.WHERE);
			if (arr.length === 0){
				return 0;
			} else if (arr.length > 1 || this.checkFilter(arr[0], query.WHERE)) {
				return 1;
			}
		}
		return 0;
	}

	private checkOption(query: any): number {
		if (!query.OPTIONS || typeof query.OPTIONS !== "object") {
			return 1;
		} else {
			let array = Object.keys(query.OPTIONS);
			if (!array.includes("COLUMNS")) {
				return 1;
			}
			for (const ele of array) {
				if (ele === "COLUMNS") {
					if (this.checkColumn(query.OPTIONS.COLUMNS)) {
						return 1;
					}
				} else if (ele === "ORDER") {
					if (this.checkOrder(query.OPTIONS)) {
						return 1;
					}
				} else {
					return 1;
				}
			}
			return 0;
		}
	}

	private checkTransformation(query: any): number {
		if (typeof query.TRANSFORMATIONS !== "object") {
			return 1;
		} else {
			let arr = Object.keys(query.TRANSFORMATIONS);
			if (arr.length !== 2) {
				return 1;
			} else {
				if (!query.TRANSFORMATIONS.GROUP || !Array.isArray(query.TRANSFORMATIONS.GROUP)
					|| query.TRANSFORMATIONS.GROUP.length === 0) {
					return 1;
				} else if (this.checkApply(query.TRANSFORMATIONS)) {
					return 1;
				}
				this.columns = query.TRANSFORMATIONS.GROUP;
				for (const o of query.TRANSFORMATIONS.APPLY) {
					this.columns.push(Object.keys(o)[0]);
				}
				if (this.checkOption(query)) {
					return 1;
				}
			}
			return 0;
		}
	}

	private checkApply(query: any): number {
		if (!query.APPLY || !Array.isArray(query.APPLY)) {
			return 1;
		} else {
			for (const apply of query.APPLY) {
				if (typeof apply !== "object") {
					return 1;
				} else {
					let app = Object.keys(apply);  // apply key
					if (app.length !== 1 || app[0].includes("_")) {
						return 1;
					} else {
						if (typeof apply[app[0]] !== "object") {
							return 1;
						} else {
							let arr = Object.keys(apply[app[0]]);
							if (arr.length !== 1) {
								return 1;
							} else if (arr[0] === "MAX" || arr[0] === "AVG" || arr[0] === "MIN" || arr[0] === "SUM") {
								if (this.checkKey(apply[app[0]][arr[0]], "m")) {
									return 1;
								}
							} else if (arr[0] !== "COUNT" || this.checkKey(apply[app[0]][arr[0]], "sm")) {
								return 1;
							}
						}
					}
				}
			}
			return 0;
		}
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
		} else if (item === "EQ") {
			res = this.checkQueryGtLtEq(obj.EQ);
		} else if (item === "IS") {
			res = this.checkQueryIs(obj.IS);
		} else if (item === "NOT") {
			res = this.checkQueryNot(obj.NOT);
		} else {
			res = 1;
		}
		return res;
	}

	private checkQueryOrAnd(arr: any): number {
		if (!Array.isArray(arr) || arr.length === 0) {
			return 1;
		} else {
			for (const obj of arr) {
				let array = Object.keys(obj);
				if (array.length === 0) {
					return 1;
				}
				for (const key of array) {
					if (this.checkFilter(key, obj)) {
						return 1;
					}
				}
			}
			return 0;
		}
	}

	private checkQueryNot(obj: any): number {
		if (typeof obj !== "object") {
			return 1;
		} else {
			let arr = Object.keys(obj);
			if (arr.length !== 1) {
				return 1;
			} else {
				return this.checkFilter(arr[0], obj);
			}
		}
	}

	private checkQueryGtLtEq(obj: any): number {
		if (typeof obj !== "object") {
			return 1;
		} else {
			let arr = Object.keys(obj);
			if (arr.length !== 1) {
				return 1;
			} else {
				if (this.checkKey(arr[0], "m") || typeof obj[arr[0]] !== "number") {
					return 1;
				} else {
					return 0;
				}
			}
		}
	}

	private checkQueryIs(obj: any): number {
		if (typeof obj !== "object") {
			return 1;
		} else {
			let arr = Object.keys(obj);
			if (arr.length !== 1) {
				return 1;
			} else {
				if (this.checkKey(arr[0], "s") || typeof obj[arr[0]] !== "string") {
					return 1;
				}
				if (obj[arr[0]].includes("*")) {
					if (obj[arr[0]].length > 2) {
						if (obj[arr[0]].substring(1, obj[arr[0]].length - 1).includes("*")) {
							return 1;
						}
					}
				}
			}
			return 0;
		}
	}

	private checkColumn(arr: any): number {
		if (!Array.isArray(arr) || arr.length === 0) {
			return 1;
		} else {
			for (const field of arr) {
				if (typeof field !== "string" || !this.columns.includes(field)) {
					return 1;
				}
			}
			return 0;
		}
	}

	private checkOrder(obj: any): number {
		if (typeof obj.ORDER === "string") {
			if (!obj.COLUMNS.includes(obj.ORDER)) {
				return 1;
			} else {
				return 0;
			}
		} else if (typeof obj.ORDER === "object") {
			let a = Object.keys(obj.ORDER);
			if (a.length !== 2 || !a.includes("dir") || !a.includes("keys")) {
				return 1;
			} else {
				if (typeof obj.ORDER.dir !== "string" || obj.ORDER.dir !== "UP" && obj.ORDER.dir !== "DOWN") {
					return 1;
				} else if (!Array.isArray(obj.ORDER.keys) || obj.ORDER.keys.length === 0) {
					return 1;
				} else {
					for (const k of obj.ORDER.keys) {
						if (!obj.COLUMNS.includes(k)) {
							return 1;
						}
					}
					return 0;
				}
			}
		}
		return 1;
	}

	private checkKey(str: any, type: string): number {
		if (typeof str !== "string") {
			return 1;
		}
		let div: number = str.indexOf("_");
		if (div === 0 || div === -1) {
			return 1;
		}
		if (this.dataset === "") {
			this.dataset = str.substring(0, div);
		} else if (this.dataset !== str.substring(0, div) || !this.ids.includes(this.dataset)) {
			return 1;
		}
		let field = str.substring(div + 1);
		if (type.includes("s") && (field === "fullname" || field === "shortname" || field === "number" ||
			field === "name" || field === "address" || field === "type" || field === "furniture" || field === "href")) {
			return 0;
		}
		if (type.includes("m") && (field === "lat" || field === "lon" || field === "seats")) {
			return 0;
		}
		return 1;
	}
}
