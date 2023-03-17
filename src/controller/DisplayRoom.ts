import {Room} from "./RoomHelper";
import {InsightResult, ResultTooLargeError} from "./IInsightFacade";
import Decimal from "decimal.js";

export class DisplayRoom {
	private rooms: any[];
	private query: any;
	private id: string;
	private result: any[];

	constructor(rooms: Room[], query: any, id: string) {
		this.rooms = rooms;
		this.query = query;
		this.id = id;
		this.result = [];
	}

	public displayRooms(): Promise<InsightResult[]> {
		return new Promise((resolve, reject) => {
			if (this.query.TRANSFORMATIONS) {
				this.calculate(this.query.TRANSFORMATIONS.GROUP, this.query.TRANSFORMATIONS.APPLY);
				if (this.result.length > 5000) {
					return reject(new ResultTooLargeError("too large"));
				}
			} else {
				if (this.rooms.length > 5000) {
					return new ResultTooLargeError("too large");
				}
				this.withoutTrans();
			}
			if (this.query.OPTIONS.ORDER) {
				if (typeof this.query.OPTIONS.ORDER === "string") {
					this.result.sort((a, b) => this.sortUp(a, b, [this.query.OPTIONS.ORDER]));
				} else if (this.query.OPTIONS.ORDER.dir === "UP"){
					this.result.sort((a, b) => this.sortUp(a, b, this.query.OPTIONS.ORDER.keys));
				} else {
					this.result.sort((a, b) => this.sortDown(a, b, this.query.OPTIONS.ORDER.keys));
				}
			}
			return resolve(this.result);
		});
	}

	private withoutTrans() {
		let keys = this.query.OPTIONS.COLUMNS;
		for (const sec of this.rooms) {
			let obj = this.displayRoom(sec, keys);
			this.result.push(obj);
		}
	}

	private displayRoom(sec: any, keys: string[]): InsightResult {

		let obj = Object.create(null);
		for (const key of keys) {
			let div = key.substring(key.search("_") + 1);
			obj[key] = sec[div];
		}
		return obj;
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

	private calculate(group: string[], apply: []) {
		let i = this.rooms.length;
		let applyKey: any[] = [], applyToken: any[] = [], keys: string[] = [];
		for (const rule of apply) {
			let list = Object.keys(rule);    // count Seats
			if (this.query.OPTIONS.COLUMNS.includes(list[0])) {
				applyKey.push(list[0]);
				let at = Object.keys(rule[list[0]])[0];
				applyToken.push(at);
				let s: string = rule[list[0]][at];
				let div = s.substring(s.search("_") + 1);
				keys.push(div);
			}
		}
		while(i !== 0 ) {
			let arr: any[] = this.rooms.shift();
			let obj = Object.create(null);
			for (const key of group) {
				if (this.query.OPTIONS.COLUMNS.includes(key)) {
					let div = key.substring(key.search("_") + 1);
					obj[key] = arr[0][div];
				}
			}
			this.applyKey(obj, arr, applyKey, applyToken, keys);
			this.result.push(obj);
			i--;
		}
	}

	private applyKey(obj: any, arr: any[], applyKey: any[], applyToken: any[], keys: string[]) {
		let res: any[] = [];
		for (let i = 0; i < applyToken.length; i++) {
			for (const room of arr) {
				if (applyToken[i] === "MAX") {
					if (res.length === i) {
						res.push(room[keys[i]]);
					} else if (room[keys[i]] > res[i]) {
						res[i] = room[keys[i]];
					}
				} else if (applyToken[i] === "MIN") {
					if (res.length === i) {
						res.push(room[keys[i]]);
					} else if (room[keys[i]] < res[i]) {
						res[i] = room[keys[i]];
					}
				} else if (applyToken[i] === "AVG") {
					if (res.length === i) {
						res.push(new Decimal(room[keys[i]]));
					} else {
						res[i] = Decimal.add(res[i], new Decimal(room[keys[i]]));
					}
				} else if (applyToken[i] === "SUM") {
					if (res.length === i) {
						res.push(new Decimal(room[keys[i]]));
					} else {
						res[i] = Decimal.add(res[i], new Decimal(room[keys[i]]));
					}
				} else {
					if (res.length === i) {
						res.push([1, [room[keys[i]]]]);
					} else if (!res[i][1].includes(room[keys[i]])) {
						res[i][1].push(room[keys[i]]);
						res[i][0]++;
					}
				}
			}
		}
		for (let i = 0; i < applyToken.length; i++) {
			if (applyToken[i] === "AVG") {
				obj[applyKey[i]] = Number((res[i].toNumber() / arr.length).toFixed(2));
			} else if (applyToken[i] === "SUM") {
				obj[applyKey[i]] = Number(res[i].toFixed(2));
			} else if (applyToken[i] === "COUNT") {
				obj[applyKey[i]] = res[i][0];
			} else {
				obj[applyKey[i]] = res[i];
			}
		}
	}

	// private applyAvg(obj: any, rooms: [], key: string, keyName: string) {
	// 	let total = new Decimal(0);
	// 	for (const room of rooms) {
	// 		let div = key.substring(key.search("_") + 1);
	// 		let num = new Decimal(room[div]);
	// 		total = Decimal.add(num, total);
	// 	}
	// 	obj[keyName] = Number((total.toNumber() / rooms.length).toFixed(2));
	// }
	//
	// private applySum(obj: any, rooms: [], key: string, keyName: string) {
	// 	let total = 0;
	// 	for (const room of rooms) {
	// 		let div = key.substring(key.search("_") + 1);
	// 		total += room[div];
	// 	}
	// 	obj[keyName] = Number(total.toFixed(2));
	// }
	//
	// private applyCount(obj: any, rooms: [], key: string, keyName: string) {
	// 	let num = 0;
	// 	let values: any[] = [];
	// 	for (const room of rooms) {
	// 		let div = key.substring(key.search("_") + 1);
	// 		if (!values.includes(room[div])) {
	// 			values.push(room[div]);
	// 			num++;
	// 		}
	// 	}
	// 	obj[keyName] = num;
	// }
	//
	// private intoResult() {
	// 	for (const room of this.rooms) {
	// 		let obj = Object.create(null);
	// 		for (const key of this.query.OPTIONS.COLUMNS) {
	// 			obj[key] = room[key];
	// 		}
	// 		this.result.push(obj);
	// 	}
	// }
}
