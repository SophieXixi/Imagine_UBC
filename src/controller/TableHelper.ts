import {Building, Room} from "./RoomHelper";
export class BuildingTable{
	public static findTable(nodes: any): any {
		let table: any[] = [];
		// empty child node
		if (nodes === undefined) {
			return table;
		} else {
			for (let node of nodes) {
				if (node.nodeName === "tbody" && this.verifyTable(node)) {
					table.push(node);
				} else {
					table = table.concat(this.findTable(node.childNodes));
				}
			}
			return table;
		}
	}
	public static verifyTable(table: any): boolean {
		let c1: boolean = false;
		let c2: boolean = false;
		let c3: boolean = false;
		let tr = table.childNodes.filter((row: any) => row.nodeName === "tr")[0];
		for (let td of tr.childNodes.filter((column: any) => column.nodeName === "td")) {
			if (td.attrs[0].name === "class") {
				const value = td.attrs[0].value;
				if (value === "views-field views-field-field-building-code") {
					c1 = true;
				}
				if (value === "views-field views-field-title") {
					c2 = true;
				}
				if (value === "views-field views-field-field-building-address") {
					c3 = true;
				}
			}
		}
		return (c1 && c2 && c3);
	}

	public static getInfo(table: any, Map: Map<string, any>): Map<string, any> {
		let rows = table[0].childNodes.filter((row: any) => row.nodeName === "tr");
		for (let tr of rows) {
			let code: string = "";
			let href: string = "";
			let building: string = "";
			let address: string = "";
			for (let td of tr.childNodes.filter((column: any) => column.nodeName === "td")) {
				if (td.attrs[0].name === "class") {
					const value = td.attrs[0].value;
					if (value === "views-field views-field-field-building-code") {
						code = td.childNodes[0].value.trim();
					}
					if (value === "views-field views-field-title") {
						href = td.childNodes[1].attrs[0].value;
						building = td.childNodes[1].childNodes[0].value.trim();
					}
					if (value === "views-field views-field-field-building-address") {
						address = td.childNodes[0].value.trim();
					}
				}
			}
			let B = new Building(building, code, address, 0, 0, href);
			Map.set(code, B);
		}
		return Map;
	}
}

export class RoomTable{
	public static findTable(nodes: any): any {
		let table: any[] = [];
		// empty child node
		if (nodes === undefined) {
			return table;
		} else {
			for (let node of nodes) {
				if (node.nodeName === "tbody" && this.verifyTable(node)) {
					table.push(node);
				} else {
					table = table.concat(this.findTable(node.childNodes));
				}
			}
			return table;
		}
	}
	public static verifyTable(table: any): boolean {
		let c1: boolean = false;
		let c2: boolean = false;
		let c3: boolean = false;
		let c4: boolean = false;
		let tr = table.childNodes.filter((row: any) => row.nodeName === "tr")[0];
		for (let td of tr.childNodes.filter((column: any) => column.nodeName === "td")) {
			if (td.attrs[0].name === "class") {
				const value = td.attrs[0].value;
				if (value === "views-field views-field-field-room-number") {
					c1 = true;
				}
				if (value === "views-field views-field-field-room-capacity") {
					c2 = true;
				}
				if (value === "views-field views-field-field-room-furniture") {
					c3 = true;
				}
				if (value === "views-field views-field-field-room-type") {
					c4 = true;
				}
			}
		}
		return (c1 && c2 && c3 && c4);
	}
	public static getInfo(Map: Map<string,any>, table: any, RoomList: Room[]) {
		let rows = table[0].childNodes.filter((row: any) => row.nodeName === "tr");
		try {
			for (let tr of rows) {
				let room = new Room("","","",0,0,"","",
					"",0,"","");
				for (let td of tr.childNodes.filter((column: any) => column.nodeName === "td")) {
					if (td.attrs[0].name === "class") {
						const value = td.attrs[0].value;
						if (value === "views-field views-field-field-room-number") {
							room.number = td.childNodes[1].childNodes[0].value.trim();
							room.href = td.childNodes[1].attrs[0].value;
						}
						if (value === "views-field views-field-field-room-capacity") {
							room.seats = Number(td.childNodes[0].value.trim());
						}
						if (value === "views-field views-field-field-room-furniture") {
							room.furniture = td.childNodes[0].value.trim();
						}
						if (value === "views-field views-field-field-room-type") {
							room.type = td.childNodes[0].value.trim();
						}
					}
				}
				let code = (this.getBuilding(room.href));
				let building = Map.get(code);
				room.shortname = building.shortname;
				room.lat = building.lat;
				room.lon = building.lon;
				room.fullname = building.fullname;
				room.address = building.address;
				let name = room.shortname + "_" + room.number;
				room.name = name;
				RoomList.push(room);
			}
			// console.log(RoomList);
		} catch (e) {
			//
		}
		return RoomList;
	}
	public static getBuilding(href: any): string{
		let building: string = "";
		// Extract the building name from the href using regular expressions
		const regex = /\/([A-Z]+-[0-9]+)/;
		const match = href.match(regex);
		if (match !== null) {
			building = match[1].split("-")[0];
		}
		return building;
	}
}

