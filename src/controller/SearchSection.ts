import {Section} from "./CourseHelper";
import {ResultTooLargeError} from "./IInsightFacade";
import {Group} from "./Group";
export class SearchSection {
	private query;
	private whole;
	private unchecked: Section[];
	private groups: any[];
	constructor(que: any, ds: any) {
		this.query = que.WHERE;
		this.unchecked = ds.sections;
		this.groups = [];
		this.whole = que;
	}

	public searchSection(): Promise<any[]> {
		return new Promise((resolve, reject) => {
			let groupKey: any[] = [], groupField: string[] = [], column: any[] = [];
			let applyKey: any[] = [], applyToken: any[] = [], keys: string[] = [];
			if (this.whole.TRANSFORMATIONS) {
				for (const key of this.whole.TRANSFORMATIONS.GROUP) {
					if (this.whole.OPTIONS.COLUMNS.includes(key)) {
						groupKey.push(key);
						groupField.push(key.substring(key.search("_") + 1));
					} else {
						column.push(key.substring(key.search("_") + 1));
					}
				}
				for (const rule of this.whole.TRANSFORMATIONS.APPLY) {
					let list = Object.keys(rule);    // count Seats
					if (this.whole.OPTIONS.COLUMNS.includes(list[0])) {
						applyKey.push(list[0]);
						let at = Object.keys(rule[list[0]])[0];
						applyToken.push(at);
						let s: string = rule[list[0]][at];
						let div = s.substring(s.search("_") + 1);
						keys.push(div);
					}
				}
			} else {
				groupKey = this.whole.OPTIONS.COLUMNS;
				for (const key of groupKey) {
					groupField.push(key.substring(key.search("_") + 1));
				}
			}
			for (const sec of this.unchecked) {
				let num = this.filterSection(sec);
				if (num === 0) {
					this.formGroup(sec, groupKey, groupField, applyKey, applyToken, column, keys);
					if (this.groups.length > 5000) {
						return reject(new ResultTooLargeError("too large"));
					}
				}
			}
			if (this.whole.TRANSFORMATIONS) {
				for (let i = 0; i < this.groups.length; i++) {
					this.groups[i] = this.groups[i].feedBack();
				}
			}
			this.order();
			return resolve(this.groups);
		});
	}

	private order() {
		if (this.whole.OPTIONS.ORDER) {
			if (typeof this.whole.OPTIONS.ORDER === "string") {
				this.groups.sort((a, b) => this.sortUp(a, b, [this.whole.OPTIONS.ORDER]));
			} else if (this.whole.OPTIONS.ORDER.dir === "UP"){
				this.groups.sort((a, b) => this.sortUp(a, b, this.whole.OPTIONS.ORDER.keys));
			} else {
				this.groups.sort((a, b) => this.sortDown(a, b, this.whole.OPTIONS.ORDER.keys));
			}
		}
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

	private formGroup(sec: any, groupKey: any[], groupField: string[],
					  applyKey: any[], applyToken: any[], column: any[], keys: string[]) {
		if (this.whole.TRANSFORMATIONS) {
			if (this.groups.length === 0) {
				let group = new Group(groupKey, groupField, applyKey, applyToken, column, keys);
				group.init(sec);
				this.groups.push(group);
			} else {
				for (const group of this.groups) {
					if (group.checkG(sec)) {
						group.addData(sec);
						return;
					}
				}
				let group = new Group(groupKey, groupField, applyKey, applyToken, column, keys);
				group.init(sec);
				this.groups.push(group);
			}
		} else {
			let obj = Object.create(null);
			for (let i = 0; i < groupKey.length; i++) {
				obj[groupKey[i]] = sec[groupField[i]];
			}
			this.groups.push(obj);
		}
	}

	private filterSection(sec: Section): number {
		let arr = Object.keys(this.query);
		if (arr.length === 0) {
			return 0;
		}
		for (const key of arr) {
			let res = this.filterKey(sec, key, this.query);
			if (res) {
				return 1;
			}
		}
		return 0;
	}

	// str: the name of the key
	// obj: the object includes the str
	private filterKey(sec: Section, str: string, obj: any): number {
		if (str === "OR") {
			return this.filterOr(obj.OR, sec);
		} else if (str === "AND") {
			return this.filterAnd(obj.AND, sec);
		} else if (str === "NOT") {
			return this.filterNot(obj.NOT, sec);
		} else if (str === "GT") {
			return this.filterGt(obj, sec);
		} else if (str === "LT") {
			return this.filterLt(obj, sec);
		} else if (str === "EQ") {
			return this.filterEq(obj, sec);
		} else if (str === "IS") {
			return this.filterIs(obj, sec);
		}
		return 1;
	}

	private filterOr(array: any, sec: Section): number {
		for (const obj of array) {
			if (this.filterKey(sec, Object.keys(obj)[0], obj) === 0) {
				return 0;
			}
		}
		return 1;
	}

	private filterAnd(array: any, sec: Section) {
		for (const obj of array) {
			if (this.filterKey(sec, Object.keys(obj)[0], obj) === 1) {
				return 1;
			}
		}
		return 0;
	}

	private filterNot(obj: any, sec: Section): number {
		let arr = Object.keys(obj);
		if (this.filterKey(sec, arr[0], obj)) {
			return 0;
		} else {
			return 1;
		}
	}

	private filterGt(obj: any, sec: any): number {
		let arr = Object.keys(obj);
		let array = Object.keys(obj[arr[0]]);
		let field = array[0].substring(array[0].search("_") + 1);
		if (sec[field] > obj[arr[0]][array[0]]) {
			return 0;
		} else {
			return 1;
		}
	}

	private filterLt(obj: any, sec: any): number {
		let arr = Object.keys(obj);
		let array = Object.keys(obj[arr[0]]);
		let field = array[0].substring(array[0].search("_") + 1);
		if (sec[field] < obj[arr[0]][array[0]]) {
			return 0;
		} else {
			return 1;
		}
	}

	private filterEq(obj: any, sec: any): number {
		let arr = Object.keys(obj);
		let array = Object.keys(obj[arr[0]]);
		let field = array[0].substring(array[0].search("_") + 1);
		if (sec[field] === obj[arr[0]][array[0]]) {
			return 0;
		} else {
			return 1;
		}
	}

	private filterIs(obj: any, sec: Section): number {
		let arr = Object.keys(obj);
		let array = Object.keys(obj[arr[0]]);
		let field = array[0].substring(array[0].search("_") + 1);
		// console.log(field);
		let str = obj[arr[0]][array[0]];
		if (str.startsWith("*") && str.endsWith("*")) {
			if (this.IsIncludes(sec, field, obj[arr[0]][array[0]])) {
				return 0;
			} else {
				return 1;
			}
		} else if (str.startsWith("*") && !(str.endsWith("*"))) {
			if (this.IsEnd(sec, field, obj[arr[0]][array[0]])) {
				return 0;
			} else {
				return 1;
			}
		} else if (!(str.startsWith("*")) && str.endsWith("*")) {
			if (this.IsStart(sec, field, obj[arr[0]][array[0]])) {
				return 0;
			} else {
				return 1;
			}
		} else {
			if (this.IsMatch(sec, field, obj[arr[0]][array[0]])) {
				return 0;
			} else {
				return 1;
			}
		}
	}

	private IsIncludes(sec: any, field: string, value: string): boolean {
		return sec[field].includes(value.substring(1, value.length - 1));
	}

	private IsStart(sec: any, field: string, value: string): boolean {
		return sec[field].startsWith(value.substring(0, value.length - 1));
	}

	private IsEnd(sec: any, field: string, value: string): boolean {
		return sec[field].endsWith(value.substring(1, value.length));
	}

	private IsMatch(sec: any, field: string, value: string): boolean {
		return sec[field] === value;
	}
}
