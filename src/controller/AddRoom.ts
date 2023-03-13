import InsightFacade from "./InsightFacade";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import JSZip from "jszip";
import * as parse5 from "parse5";
import {Room} from "./RoomHelper";
import {BuildingTable, RoomTable} from "./TableHelper";
import {Dataset} from "./DatasetHelper";

export class AddRoom {
	public facade: InsightFacade;

	constructor(insightfacde: InsightFacade) {
		this.facade = insightfacde;
	}

	public addRoom(ID: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		async function buildingGeo(BuildingMap: any, buildingtable: any) {
			BuildingTable.getInfo(buildingtable, BuildingMap);
			await BuildingTable.buildingGeo(BuildingMap.values());
		}
		return new Promise((fulfill, reject) => {
			let RoomList: Room[] = [];
			let newzip = new JSZip();
			let BuildingMap = new Map<string, any>();
			newzip
				.loadAsync(content, {base64: true})
				.then((zip) => {
					let index = zip.file("index.htm");
					if (index === null) {
						return reject(new InsightError("No index file in the folder!"));
					} else {
						// check table
						index
							.async("string")
							.then(async (data) => {
								try {
									let document = parse5.parse(data);
									let buildingtable = BuildingTable.findTable(document.childNodes);
									if (buildingtable.length === 0) {
										return reject(new InsightError("No valid table"));
									}
									await buildingGeo(BuildingMap, buildingtable);
									return fulfill(this.htmhelper(BuildingMap, zip, RoomList, ID, kind));
								} catch (e) {
									return reject(new Error("parse error"));
								}
							})
							.catch(() => {
								return reject(new InsightError("Fail to parse the index file"));
							});
					}
				})
				.catch(() => {
					return reject(new InsightError("Not a zip file, failed to load!"));
				});
		});
	}

	private htmhelper(
		BuildingMap: Map<string, any>,
		zip: any,
		RoomList: any[],
		ID: any,
		kind: InsightDatasetKind
	): Promise<any> {
		let hrefPromises: any[] = [];
		return new Promise((fulfill, reject) => {
			for (let building of BuildingMap.values()) {
				let htm = zip.file(building.href.substring(2));
				if (htm !== null) {
					hrefPromises.push(htm.async("string"));
				}
			}
			Promise.all(hrefPromises)
				.then((files) => {
					return fulfill(this.roomhelper(files, BuildingMap, RoomList, ID, kind));
				})
				.catch((err) => {
					return reject(err);
				});
		});
	}

	private roomhelper(
		files: any,
		BuildingMap: Map<string, any>,
		RoomList: Room[],
		ID: any,
		kind: InsightDatasetKind
	): Promise<any> {
		return new Promise((fulfill, reject) => {
			for (let file of files) {
				let cont = parse5.parse(file);
				let roomtable = RoomTable.findTable(cont.childNodes);
				if (roomtable.length !== 0) {
					RoomTable.getInfo(BuildingMap, roomtable, RoomList);
				}
			}
			if (RoomList.length === 0) {
				return reject(new Error("no valid room!"));
			}
			let dataset = new Dataset(ID, RoomList, kind);
			const re = InsightFacade.store(ID, dataset);
			return fulfill(re);
		});
	}
}
