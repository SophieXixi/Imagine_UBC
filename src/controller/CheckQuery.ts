export class CheckQuery {
	private dataset: string;
	constructor() {
		this.dataset = "";
	}
	public getDataset(): string {
		return this.dataset;
	}
	/* if query is invalid, return 1;
	   if query is valid, return 0;
	 */
	public checkQuery(que: unknown): number {
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
		} else if (item === "EQ") {
			res = this.checkQueryGtLtEq(obj.EQ);
		} else if (item === "IS") {
			res = this.checkQueryIs(obj.IS);
		} else if (item === "NOT") {
			res = this.checkQueryNot(obj.NOT);
		} else {
			res = 0;
		}
		return res;
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
	private checkQueryNot(obj: any): number {
		if (typeof obj !== "object") {
			return 1;
		} else {
			let arr;
			arr = Object.keys(obj);
			if (arr.length !== 1) {
				return 1;
			} else {
				return this.checkFilter(arr[0], obj.NOT);
			}
		}
	}
	private checkQueryGtLtEq(obj: any): number {
		if (typeof obj !== "object") {
			return 1;
		} else {
			let arr;
			arr = Object.keys(obj);
			if (arr.length !== 1) {
				return 1;
			} else {
				if (this.checkKey(arr[0], "m") || typeof obj.arr !== "number") {
					return 1;
				}
			}
			return 0;
		}
	}
	private checkQueryIs(obj: any): number {
		if (typeof obj !== "object") {
			return 1;
		} else {
			let arr;
			arr = Object.keys(obj);
			if (arr.length !== 1) {
				return 1;
			} else {
				if (this.checkKey(arr[0], "s") || typeof obj.arr !== "string") {
					return 1;
				}
			}
			return 0;
		}
	}
	private checkKey(str: string, type: string): number {
		let div: number;
		div = str.search("_");
		if (div === 0) {
			return 1;
		}
		// check dataset
		if (this.dataset === "") {
			this.dataset = str.substring(0, div);
		} else if (this.dataset !== str.substring(0, div)) {
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
			if (field === "avg" || field === "pass" || field === "fail" ||
				field === "audit" || field === "year") {
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
				if (this.checkKey(field, "sm")) {
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
			return obj.COLUMNS.includes(obj.ORDER);
		}
	}
}
