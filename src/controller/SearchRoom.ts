import {ResultTooLargeError} from "./IInsightFacade";
import {Room} from "./RoomHelper";
export class SearchRoom {
	private query;
	private whole;
	private unchecked: Room[];
	private valid_room: any[];
	constructor(que: any, ds: any) {
		this.query = que.WHERE;
		this.unchecked = ds.rooms;
		this.valid_room = [];
		this.whole = que;
	}

	public searchRoom(): Promise<any[]> {
		return new Promise((resolve, reject) => {
			for (const room of this.unchecked) {
				let num: number;
				num = this.filterRoom(room);
				if (num === 0) {
					this.formGroup(room);
				}
			}
			return resolve(this.valid_room);
		});
	}

	private formGroup(room: Room) {
		if (this.whole.TRANSFORMATIONS) {
			if (this.valid_room.length === 0) {
				this.valid_room.push([room]);
			} else {
				for (let i = 0; i < this.valid_room.length; i++) {
					if (this.checkGroup(room, i, this.whole.TRANSFORMATIONS.GROUP)) {
						this.valid_room[i].push(room);
						return;
					}
				}
				this.valid_room.push([room]);
			}
		} else {
			this.valid_room.push(room);
		}
	}

	private checkGroup(room: any, i: number, keys: string[]): number{
		for (const key of keys) {
			let div = key.substring(key.search("_") + 1);
			if (room[div] !== this.valid_room[i][0][div]) {
				return 0;
			}
		}
		return 1;
	}

	private filterRoom(room: Room): number {
		if (this.query === null) {
			return 0;
		}
		let arr = Object.keys(this.query);
		if (arr.length === 0) {
			return 0;
		}
		for (const key of arr) {
			let res = this.filterKey(room, key, this.query);
			if (res) {
				return 1;
			}
		}
		return 0;
	}

	private filterKey(room: Room, str: string, obj: any): number {
		if (str === "OR") {
			return this.filterOr(obj.OR, room);
		} else if (str === "AND") {
			return this.filterAnd(obj.AND, room);
		} else if (str === "NOT") {
			return this.filterNot(obj.NOT, room);
		} else if (str === "GT") {
			return this.filterGt(obj, room);
		} else if (str === "LT") {
			return this.filterLt(obj, room);
		} else if (str === "EQ") {
			return this.filterEq(obj, room);
		} else if (str === "IS") {
			return this.filterIs(obj, room);
		}
		return 1;
	}

	private filterOr(array: any, room: Room): number {
		for (const obj of array) {
			if (this.filterKey(room, Object.keys(obj)[0], obj) === 0) {
				return 0;
			}
		}
		return 1;
	}

	private filterAnd(array: any, room: Room) {
		for (const obj of array) {
			if (this.filterKey(room, Object.keys(obj)[0], obj) === 1) {
				return 1;
			}
		}
		return 0;
	}

	private filterNot(obj: any, room: Room): number {
		let arr = Object.keys(obj);
		if (this.filterKey(room, arr[0], obj)) {
			return 0;
		} else {
			return 1;
		}
	}

	private filterGt(obj: any, room: any): number {
		let arr = Object.keys(obj);
		let array = Object.keys(obj[arr[0]]);
		let field = array[0].substring(array[0].search("_") + 1);
		if (room[field] > obj[arr[0]][array[0]]) {
			return 0;
		} else {
			return 1;
		}
	}

	private filterLt(obj: any, room: any): number {
		let arr = Object.keys(obj);
		let array = Object.keys(obj[arr[0]]);
		let field = array[0].substring(array[0].search("_") + 1);
		if (room[field] < obj[arr[0]][array[0]]) {
			return 0;
		} else {
			return 1;
		}
	}

	private filterEq(obj: any, room: any): number {
		let arr = Object.keys(obj);
		let array = Object.keys(obj[arr[0]]);
		let field = array[0].substring(array[0].search("_") + 1);
		if (room[field] === obj[arr[0]][array[0]]) {
			return 0;
		} else {
			return 1;
		}
	}

	private filterIs(obj: any, room: Room): number {
		let arr = Object.keys(obj);
		let array = Object.keys(obj[arr[0]]);
		let field = array[0].substring(array[0].search("_") + 1);
		let str = obj[arr[0]][array[0]];
		if (str.startsWith("*") && str.endsWith("*")) {
			if (this.IsIncludes(room, field, obj[arr[0]][array[0]])) {
				return 0;
			} else {
				return 1;
			}
		} else if (str.startsWith("*") && !(str.endsWith("*"))) {
			if (this.IsEnd(room, field, obj[arr[0]][array[0]])) {
				return 0;
			} else {
				return 1;
			}
		} else if (!(str.startsWith("*")) && str.endsWith("*")) {
			if (this.IsStart(room, field, obj[arr[0]][array[0]])) {
				return 0;
			} else {
				return 1;
			}
		} else {
			if (this.IsMatch(room, field, obj[arr[0]][array[0]])) {
				return 0;
			} else {
				return 1;
			}
		}
	}

	private IsIncludes(room: any, field: string, value: string): boolean {
		return room[field].includes(value.substring(1, value.length - 1));
	}

	private IsStart(room: any, field: string, value: string): boolean {
		return room[field].startsWith(value.substring(0, value.length - 1));
	}

	private IsEnd(room: any, field: string, value: string): boolean {
		return room[field].endsWith(value.substring(1, value.length));
	}

	private IsMatch(room: any, field: string, value: string): boolean {
		return room[field] === value;
	}
}
