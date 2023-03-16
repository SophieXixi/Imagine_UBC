import {InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {Section} from "./CourseHelper";
import Decimal from "decimal.js";

export class DisplaySection {
	private secs: any[];
	public query: any;
	private id: string;
	private result: any[];

	constructor(secs: any[], query: any, id: string) {
		this.secs = secs;
		this.query = query;
		this.id = id;
		this.result = [];
	}

	public displaySections(): Promise<InsightResult[]> {
		return new Promise((resolve, reject) => {
			if (this.query.TRANSFORMATIONS) {
				this.calculate(this.query.TRANSFORMATIONS.GROUP, this.query.TRANSFORMATIONS.APPLY);
				if (this.result.length > 5000) {
					return reject(new ResultTooLargeError("too large"));
				}
			} else {
				if (this.secs.length > 5000) {
					return reject(new ResultTooLargeError("too large"));
				}
				this.withoutTrans();
			}
			if (this.query.OPTIONS.ORDER) {
				if (typeof this.query.OPTIONS.ORDER === "string") {
					// this.orderString(this.query.OPTIONS.ORDER);
					this.result.sort((a, b) => this.sortUp(a, b, [this.query.OPTIONS.ORDER]));
				} else if (this.query.OPTIONS.ORDER.dir === "UP"){
					this.result.sort((a, b) => this.sortUp(a, b, this.query.OPTIONS.ORDER.keys));
					// this.result.sort(this.objectUP);
				} else {
					// this.orderObjectDown(this.query.OPTIONS.ORDER.keys);
					this.result.sort((a, b) => this.sortDown(a, b, this.query.OPTIONS.ORDER.keys));
				}
			}
			return resolve(this.result);
		});
	}

	private sortUp(a: any, b: any, keys: any[]): number {
		let key: string = keys[0];
		if (a[key] > b[key]) {
			return 1;
		} else if (a[key] < b[key]) {
			return -1;
		} else if (keys.slice(1).length === 0) {
			return 0;
		} else {
			return this.sortUp(a, b, keys.slice(1));
		}
	}

	private sortDown(a: any, b: any, keys: any[]): number {
		let key: string = keys[0];
		if (a[key] > b[key]) {
			return -1;
		} else if (a[key] < b[key]) {
			return 1;
		} else if (keys.slice(1).length === 0) {
			return 0;
		} else {
			return this.sortDown(a, b, keys.slice(1));
		}
	}

	private withoutTrans() {
		// console.log(this.query);
		let keys = this.query.OPTIONS.COLUMNS;
		for (const sec of this.secs) {
			let obj = Object.create(null);
			let s: any = sec;
			for (const key of keys) {
				let div = key.substring(key.search("_") + 1);
				obj[key] = s[div];
			}
			this.result.push(obj);
		}
	}

	// private objectUP(a: any, b: any): number {
	// 	let sorting = Object.keys(this.query.OPTIONS.ORDER["keys"]);
	// 	for (const key of sorting) {
	// 		if (typeof a[key] === "string") {
	// 			if (a[key].localeCompare(b[key]) !== 0) {
	// 				return a[key].localeCompare(b[key]);
	// 			}
	// 		} else {
	// 			if (a[key] !== b[key]) {
	// 				return a[key] - b[key];
	// 			}
	// 		}
	// 	}
	// 	return 0;
	// }
	// private objectDown(a: any, b: any): number {
	// 	let sorting = Object.keys(this.query.OPTIONS.ORDER["keys"]);
	// 	for (const key of sorting) {
	// 		if (a[key] > b[key]) {
	// 			return 1;
	// 		} else if (a[key] < b[key]) {
	// 			return -1;
	// 		}
	// 	}
	// 	return 0;
	// }
	// private orderString(keys: string[]) {
	// 	for (let i = 0; i < this.result.length; i++) {
	// 		let min = this.findMin(i, keys);
	// 		let s = this.result[i];
	// 		this.result[i] = this.result[min];
	// 		this.result[min] = s;
	// 	}
	// }
	//
	// private findMin(i: number, keys: string[]): number {
	// 	let curr = i + 1;
	// 	let min: number = i;
	// 	while (curr !== this.result.length) {
	// 		for (const item of keys) {
	// 			let a = this.findMinHelp(curr, min, item);
	// 			if (a > 0) {
	// 				break;
	// 			} else if (a < 0) {
	// 				min = curr;
	// 				break;
	// 			}
	// 		}
	// 		curr++;
	// 	}
	// 	return min;
	// }
	//
	// private findMinHelp(curr: number, min: number, key: string): number {
	// 	if (typeof this.result[curr][key] === "string") {
	// 		// min before curr, return 1; same return 0; after return -1;
	// 		return this.result[curr][key].localeCompare(this.result[min][key]);
	// 	} else {
	// 		return this.result[curr][key] - this.result[min][key];
	// 	}
	// }
	//
	// private findMax(i: number, keys: string[]): number {
	// 	let curr = i + 1;
	// 	let max: number = i;
	// 	while (curr !== this.result.length) {
	// 		for (const item of keys) {
	// 			let a = this.findMaxHelp(curr, max, item);
	// 			if (a < 0) {
	// 				break;
	// 			} else if (a > 0) {
	// 				max = curr;
	// 				break;
	// 			}
	// 		}
	// 		curr++;
	// 	}
	// 	return max;
	// }
	//
	// private findMaxHelp(curr: number, max: number, key: string): number {
	// 	if (typeof this.result[curr][key] === "string") {
	// 		// min before curr, return 1; same return 0; after return -1;
	// 		return this.result[curr][key].localeCompare(this.result[max][key]);
	// 	} else {
	// 		return this.result[curr][key] - this.result[max][key];
	// 	}
	// }

	private withTrans() {
		// this.intoResult();
	}

	private calculate(group: string[], apply: []) {
		let i = this.secs.length;
		while(i !== 0) {
			let arr: any[] = this.secs.shift();
			let obj = Object.create(null);
			for (const key of group) {
				if (this.query.OPTIONS.COLUMNS.includes(key)) {
					let div = key.substring(key.search("_") + 1);
					obj[key] = arr[0][div];
				}
			}
			for (const rule of apply) {
				let list = Object.keys(rule);    // count Seats
				if (this.query.OPTIONS.COLUMNS.includes(list[0])) {
					let ob = rule[list[0]];			// { count: rooms seats }
					let token = Object.keys(ob);	// COUNT
					let key: string = ob[token[0]];
					let div = key.substring(key.search("_") + 1);
					if (token[0] === "MAX") {
						let num = Math.max(...arr.map((a) => a[div]));
						obj[list[0]] = num;
					} else if (token[0] === "MIN") {
						let num = Math.min(...arr.map((a) => a[div]));
						obj[list[0]] = num;
					} else if (token[0] === "AVG") {
						this.applyAvg(obj, arr,  ob[token[0]], list[0]);
					} else if (token[0] === "SUM") {
						this.applySum(obj, arr,  ob[token[0]], list[0]);
					} else {
						this.applyCount(obj, arr, ob[token[0]], list[0]);
					}
				}
			}
			this.result.push(obj);
			i--;
		}
	}

	// private applyKey(obj: any, secs: any[], token: any[], keyName: string) {
	// 	if (token.includes("MAX")) {
	// 		let num = Math.max(...secs.map((a) => a[div]));
	// 		obj[secs[0]] = num;
	// 	} else if (token.includes("MIN")) {
	// 		let num = Math.min(...secs.map((a) => a[div]));
	// 		obj[secs[0]] = num;
	// 	}
	// 	let avgTotal = new Decimal(0), sumTotal = new Decimal(0), countTotal = 0, num = 0;
	// 	let countValue: any[] = [];
	// 	for (const sec of secs) {
	// 		if (token.includes("AVG")) {
	// 			let div = key.substring(key.search("_") + 1);
	// 			let num = new Decimal(sec[div]);
	// 			avgTotal = Decimal.add(num, avgTotal);
	// 		} else if (token.includes("SUM")) {
	// 			let div = key.substring(key.search("_") + 1);
	// 			let num = new Decimal(sec[div]);
	// 			sumTotal = Decimal.add(num, sumTotal);
	// 		} else if (token.includes("COUNT")) {
	// 			let div = key.substring(key.search("_") + 1);
	// 			if (!countValue.includes(sec[div])) {
	// 				countValue.push(sec[div]);
	// 				num++;
	// 			}
	// 		}
	// 	}
	// }

	private applyAvg(obj: any, secs: any[], key: string, keyName: string) {
		let total = new Decimal(0);
		for (const sec of secs) {
			let div = key.substring(key.search("_") + 1);
			let num = new Decimal(sec[div]);
			total = Decimal.add(num, total);
		}
		obj[keyName] = Number((total.toNumber() / secs.length).toFixed(2));
	}

	private applySum(obj: any, secs: any[], key: string, keyName: string) {
		let total = new Decimal(0);
		for (const sec of secs) {
			let div = key.substring(key.search("_") + 1);
			let num = new Decimal(sec[div]);
			total = Decimal.add(num, total);
		}
		obj[keyName] = Number((total.toNumber()).toFixed(2));
	}

	private applyCount(obj: any, secs: any[], key: string, keyName: string) {
		let num = 0;
		let values: any[] = [];
		for (const sec of secs) {
			let div = key.substring(key.search("_") + 1);
			if (!values.includes(sec[div])) {
				values.push(sec[div]);
				num++;
			}
		}
		obj[keyName] = num;
	}

	private intoResult() {
		for (const sec of this.secs) {
			let obj = Object.create(null);
			for (const key of this.query.OPTIONS.COLUMNS) {
				obj[key] = sec[key];
			}
			this.result.push(obj);
		}
	}
}
