import {InsightResult} from "./IInsightFacade";
import {Section} from "./CourseHelper";
import Decimal from "decimal.js";

export class DisplaySection {
	private secs: Section[];
	private query: any;
	private id: string;
	private result: any[];
	private trans: any[];

	constructor(secs: Section[], query: any, id: string) {
		this.secs = secs;
		this.query = query;
		this.id = id;
		this.result = [];
		this.trans = [];
	}

	public displaySections(): InsightResult[] {
		if (this.query.TRANSFORMATIONS) {
			this.withTrans();
		} else {
			this.withoutTrans();
		}
		if (this.query.OPTIONS.ORDER) {
			if (typeof this.query.OPTIONS.ORDER === "string") {
				this.orderString(this.query.OPTIONS.ORDER);
			} else if (this.query.OPTIONS.ORDER.dir === "UP"){
				this.orderString(this.query.OPTIONS.ORDER.keys);
			} else {
				this.orderObjectDown(this.query.OPTIONS.ORDER.keys);
			}
		}
		return this.result;
	}

	private withoutTrans() {
		console.log(this.query);
		let keys = this.query.OPTIONS.COLUMNS;
		for (const sec of this.secs) {
			let obj = this.displaySection(sec, keys);
			this.result.push(obj);
		}
	}

	private displaySection(sec: any, keys: string[]): InsightResult {
		let obj = Object.create(null);
		for (const key of keys) {
			let div = key.substring(key.search("_") + 1);
			obj[key] = sec[div];
		}
		return obj;
	}

	private orderString(keys: string[]) {
		for (let i = 0; i < this.result.length; i++) {
			let min = this.findMin(i, keys);
			let s = this.result[i];
			this.result[i] = this.result[min];
			this.result[min] = s;
		}
	}

	private findMin(i: number, keys: string[]): number {
		let curr = i + 1;
		let min: number = i;
		while (curr !== this.result.length) {
			for (const item of keys) {
				let a = this.findMinHelp(curr, min, item);
				if (a > 0) {
					break;
				} else if (a < 0) {
					min = curr;
					break;
				}
			}
			curr++;
		}
		return min;
	}

	private findMinHelp(curr: number, min: number, key: string): number {
		if (typeof this.result[curr][key] === "string") {
			// min before curr, return 1; same return 0; after return -1;
			return this.result[curr][key].localeCompare(this.result[min][key]);
		} else {
			return this.result[curr][key] - this.result[min][key];
		}
	}

	private orderObjectDown(keys: string[]) {
		for (let i = 0; i < this.result.length; i++) {
			let max = this.findMax(i, keys);
			let s = this.result[i];
			this.result[i] = this.result[max];
			this.result[max] = s;
		}
	}

	private findMax(i: number, keys: string[]): number {
		let curr = i + 1;
		let max: number = i;
		while (curr !== this.result.length) {
			for (const item of keys) {
				let a = this.findMaxHelp(curr, max, item);
				if (a < 0) {
					break;
				} else if (a > 0) {
					max = curr;
					break;
				}
			}
			curr++;
		}
		return max;
	}

	private findMaxHelp(curr: number, max: number, key: string): number {
		if (typeof this.result[curr][key] === "string") {
			// min before curr, return 1; same return 0; after return -1;
			return this.result[curr][key].localeCompare(this.result[max][key]);
		} else {
			return this.result[curr][key] - this.result[max][key];
		}
	}

	private withTrans() {
		for(const sec of this.secs) {
			this.formGroup(sec);
			// console.log("————————————————————————————————————");
		}
		// console.log(this.trans);
		this.calculate(this.query.TRANSFORMATIONS.GROUP, this.query.TRANSFORMATIONS.APPLY);
		this.intoResult();
	}

	private formGroup(sec: Section) {
		let group = [];
		if (this.trans.length === 0) {
			// console.log("length 0");
			group.push(sec);
			this.trans.push(group);
		} else {
			for (let i = 0; i < this.trans.length; i++) {
				if (this.checkGroup(sec, i, this.query.TRANSFORMATIONS.GROUP)) {
					this.trans[i].push(sec);
					return;
				}
			}
			group.push(sec);
			this.trans.push(group);
		}
	}

	private checkGroup(sec: any, i: number, keys: string[]): number{
		for (const key of keys) {
			let div = key.substring(key.search("_") + 1);
			// console.log(sec[div]);
			// console.log(div);
			// console.log(this.trans[i][0][div]);
			if (sec[div] !== this.trans[i][0][div]) {
				return 0;
			}
		}
		return 1;
	}

	private calculate(group: string[], apply: []) {
		let i = 0;
		while(i < this.trans.length) {
			let arr = this.trans.shift();
			let obj = Object.create(null);
			for (const key of group) {
				let div = key.substring(key.search("_") + 1);
				obj[key] = arr[0][div];
			}
			for (const rule of apply) {
				let list = Object.keys(rule);    // count Seats
				let ob = rule[list[0]];			// { count: rooms seats }
				let token = Object.keys(ob);	// COUNT
				if (token[0] === "MAX") {
					this.applyMax(obj, arr, ob[token[0]], list[0]);
				} else if (token[0] === "MIN") {
					this.applyMin(obj, arr,  ob[token[0]], list[0]);
				} else if (token[0] === "AVG") {
					this.applyAvg(obj, arr,  ob[token[0]], list[0]);
				} else if (token[0] === "SUM") {
					this.applySum(obj, arr,  ob[token[0]], list[0]);
				} else {
					this.applyCount(obj, arr, ob[token[0]], list[0]);
				}
			}
			this.trans.push(obj);
			i++;
		}
	}

	private applyMax(obj: any, secs: [], key: string, keyName: string) {
		let num = null;
		for (const sec of secs) {
			let div = key.substring(key.search("_") + 1);
			if (num === null || sec[div] > num) {
				num = sec[div];
			}
		}
		obj[keyName] = num;
	}

	private applyMin(obj: any, secs: [], key: string, keyName: string) {
		let num = null;
		for (const sec of secs) {
			let div = key.substring(key.search("_") + 1);
			if (num === null || sec[div] < num) {
				num = sec[div];
			}
		}
		obj[keyName] = num;
	}

	private applyAvg(obj: any, secs: [], key: string, keyName: string) {
		let total = new Decimal(0);
		for (const sec of secs) {
			let div = key.substring(key.search("_") + 1);
			let num = new Decimal(sec[div]);
			total = Decimal.add(num, total);
		}
		obj[keyName] = Number((total.toNumber() / secs.length).toFixed(2));
	}

	private applySum(obj: any, secs: [], key: string, keyName: string) {
		let total = 0;
		for (const sec of secs) {
			let div = key.substring(key.search("_") + 1);
			total += sec[div];
		}
		obj[keyName] = Number(total.toFixed(2));
	}

	private applyCount(obj: any, secs: [], key: string, keyName: string) {
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
		for (const sec of this.trans) {
			let obj = Object.create(null);
			for (const key of this.query.OPTIONS.COLUMNS) {
				obj[key] = sec[key];
			}
			this.result.push(obj);
		}
	}
}
