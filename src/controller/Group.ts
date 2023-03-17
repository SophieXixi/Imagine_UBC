import Decimal from "decimal.js";

export class Group {
	private applyKey: any[];
	private applyToken: any[];
	private keys: string[];
	private res: any[];
	private groupKey: any[];
	private groupField: string[];
	private obj;
	private number;
	private columnKey: string[];
	private columnValue: any[];

	constructor(gk: any[], gf: string[], ak: any[], at: any[], column: string[], keys: any[]) {
		this.groupKey = gk;
		this.groupField = gf;
		this.applyKey = ak;
		this.applyToken = at;
		this.keys = keys;
		this.columnKey = [];
		for (const key of column) {
			this.columnKey.push(key.substring(key.search("_") + 1));
		}
		this.columnValue = [];
		this.res = [];
		this.obj = Object.create(null);
		this.number = 0;
	}

	public init(sec: any) {
		for (let i = 0; i < this.groupField.length; i++) {
			this.obj[this.groupKey[i]] = sec[this.groupField[i]];
		}
		for (const key of this.columnKey) {
			let call: string = key;
			this.columnValue.push(sec[call]);
		}
		// console.log(this.columnKey);
		// console.log(this.columnValue);
		for (let j = 0; j < this.applyToken.length; j++) {
			if (this.applyToken[j] === "MAX") {
				this.res.push(sec[this.keys[j]]);
			} else if (this.applyToken[j] === "MIN") {
				this.res.push(sec[this.keys[j]]);
			} else if (this.applyToken[j] === "AVG") {
				this.res.push(new Decimal(sec[this.keys[j]]));
			} else if (this.applyToken[j] === "SUM") {
				this.res.push(new Decimal(sec[this.keys[j]]));
			} else {
				let s: any[] = [];
				s.push(sec[this.keys[j]]);
				this.res.push([1, s]);
			}
		}
		this.number = 1;
	}

	public addData(sec: any) {
		for (let i = 0; i < this.applyToken.length; i++) {
			if (this.applyToken[i] === "MAX") {
				if (sec[this.keys[i]] > this.res[i]) {
					this.res[i] = sec[this.keys[i]];
				}
			} else if (this.applyToken[i] === "MIN") {
				if (sec[this.keys[i]] < this.res[i]) {
					this.res[i] = sec[this.keys[i]];
				}
			} else if (this.applyToken[i] === "AVG") {
				this.res[i] = Decimal.add(this.res[i], new Decimal(sec[this.keys[i]]));
			} else if (this.applyToken[i] === "SUM") {
				this.res[i] = Decimal.add(this.res[i], new Decimal(sec[this.keys[i]]));
			} else {
				if (!this.res[i][1].includes(sec[this.keys[i]])) {
					this.res[i][1].push(sec[this.keys[i]]);
					this.res[i][0]++;
				}
			}
		}
		this.number++;
	}

	public checkG(sec: any): boolean {
		for (let i = 0; i < this.groupField.length; i++) {
			if (sec[this.groupField[i]] !== this.obj[this.groupKey[i]]) {
				return false;
			}
		}
		if (this.columnKey.length !== 0) {
			for (let i = 0; i < this.columnKey.length; i++) {
				// console.log(this.columnKey[i]);
				// console.log(this.columnValue[i]);
				if (sec[this.columnKey[i]] !== this.columnValue[i]) {
					return false;
				}
			}
		}
		return true;
	}

	public feedBack(): object {
		for (let i = 0; i < this.applyToken.length; i++) {
			if (this.applyToken[i] === "AVG") {
				this.obj[this.applyKey[i]] = Number((this.res[i].toNumber() / this.number).toFixed(2));
			} else if (this.applyToken[i] === "SUM") {
				this.obj[this.applyKey[i]] = Number(this.res[i].toFixed(2));
			} else if (this.applyToken[i] === "COUNT") {
				this.obj[this.applyKey[i]] = this.res[i][0];
			} else {
				this.obj[this.applyKey[i]] = this.res[i];
			}
		}
		return this.obj;
	}
}
