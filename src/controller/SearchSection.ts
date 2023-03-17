import {Section} from "./CourseHelper";
import {ResultTooLargeError} from "./IInsightFacade";
export class SearchSection {
	private query;
	private whole;
	private unchecked: Section[];
	private valid_sections: any[];
	constructor(que: any, ds: any) {
		this.query = que.WHERE;
		this.unchecked = ds.sections;
		this.valid_sections = [];
		this.whole = que;
	}

	public searchSection(): Promise<any[]> {
		return new Promise((resolve, reject) => {
			for (const sec of this.unchecked) {
				let num = this.filterSection(sec);
				if (num === 0) {
					this.formGroup(sec);
				}
			}
			return resolve(this.valid_sections);
		});
	}

	private formGroup(sec: Section) {
		if (this.whole.TRANSFORMATIONS) {
			if (this.valid_sections.length === 0) {
				this.valid_sections.push([sec]);
			} else {
				for (let i = 0; i < this.valid_sections.length; i++) {
					if (this.checkGroup(sec, i, this.whole.TRANSFORMATIONS.GROUP)) {
						this.valid_sections[i].push(sec);
						return;
					}
				}
				this.valid_sections.push([sec]);
			}
		} else {
			this.valid_sections.push(sec);
		}
	}

	private checkGroup(sec: any, i: number, keys: string[]): number{
		for (const key of keys) {
			let div = key.substring(key.search("_") + 1);
			if (sec[div] !== this.valid_sections[i][0][div]) {
				return 0;
			}
		}
		return 1;
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
