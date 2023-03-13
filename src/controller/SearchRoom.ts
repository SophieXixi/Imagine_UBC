import {Section} from "./CourseHelper";
import {ResultTooLargeError} from "./IInsightFacade";
export class SearchRoom {
	private query;
	private unchecked: Section[];
	private valid_sections: Section[];
	constructor(que: any, ds: any) {
		this.query = que;
		this.unchecked = ds.sections;
		this.valid_sections = [];
	}
	public searchRoom(): Promise<Section[]> {
		return new Promise((resolve, reject) => {
			for (const sec of this.unchecked) {
				let num: number;
				num = this.filterSection(sec);
				if (num === 0) {
					this.valid_sections.push(sec);
				}
			}
			if (this.valid_sections.length > 5000) {
				return reject(new ResultTooLargeError("> 5000"));
			} else {
				return resolve(this.valid_sections);
			}
		});
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
	private IsStart(sec: Section, field: string, value: string): boolean {
		if (field === "dept") {
			return sec.dept.startsWith(value.substring(0, value.length - 1));
		} else if (field === "id") {
			return sec.id.startsWith(value.substring(0, value.length - 1));
		} else if (field === "instructor") {
			return sec.instructor.startsWith(value.substring(0, value.length - 1));
		} else if (field === "title") {
			return sec.title.startsWith(value.substring(0, value.length - 1));
		} else {
			return sec.uuid.startsWith(value.substring(0, value.length - 1));
		}
	}
	private IsEnd(sec: Section, field: string, value: string): boolean {
		if (field === "dept") {
			return sec.dept.endsWith(value.substring(1, value.length));
		} else if (field === "id") {
			return sec.id.endsWith(value.substring(1, value.length));
		} else if (field === "instructor") {
			return sec.instructor.endsWith(value.substring(1, value.length));
		} else if (field === "title") {
			return sec.title.endsWith(value.substring(1, value.length));
		} else {
			return sec.uuid.endsWith(value.substring(1, value.length));
		}
	}
	private IsMatch(sec: Section, field: string, value: string): boolean {
		if (field === "dept") {
			return sec.dept === value;
		} else if (field === "id") {
			return sec.id === value;
		} else if (field === "instructor") {
			return sec.instructor === value;
		} else if (field === "title") {
			return sec.title === value;
		} else {
			return sec.uuid === value;
		}
	}
}
