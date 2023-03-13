import InsightFacade from "./InsightFacade";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import JSZip from "jszip";
import * as parse5 from "parse5";
import * as http from "http";
import {Room} from "./RoomHelper";
import {BuildingTable, RoomTable} from "./TableHelper";
import {Dataset} from "./DatasetHelper";

export class AddRoom {
	public facade: InsightFacade;

	constructor(insightfacde: InsightFacade) {
		this.facade = insightfacde;
	}

	public addRoom(ID: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise((fulfill, reject) => {
			let geoPromises: any[] = [];
			let hrefPromises: any[] = [];
			let RoomList: Room[] = [];
			let newzip = new JSZip();
			let BuildingMap = new Map <string, any>();
			newzip.loadAsync(content, {base64: true}).then((zip) => {
				let index = zip.file("index.htm");
				if (index === null) {
					return reject(new InsightError("No index file in the folder!"));
				} else {
					// check table
					index.async("string").then((data) => {
						try {
							let document = parse5.parse(data);
							let buildingtable = BuildingTable.findTable(document.childNodes);
							if (buildingtable.length === 0) {
								return reject(new InsightError("No valid table"));
							}
							BuildingTable.getInfo(buildingtable, BuildingMap);
							for (let building of BuildingMap.values()) {
								geoPromises.push(this.buildingGeo(building));
								let htm = zip.file(building.href.substring(2));
								if (htm !== null) {
									hrefPromises.push(htm.async("string"));
								}
							}
							Promise.all(geoPromises).then(() => {
								Promise.all(hrefPromises).then((files) => {
									return fulfill(this.roomhelper(files, BuildingMap, RoomList, ID, kind));
								}).catch((err) => {
									return reject(err);
								});
							}).catch((err) => {
								return reject(err);
							});
						} catch (e) {
							return reject(new Error("parse error"));
						}
					}).catch(() => {
						return reject(new InsightError("Fail to parse the index file"));
					});
				}
			})
				.catch(() => {
					return reject(new InsightError("Not a zip file, failed to load!"));
				});
		});
	}

	private roomhelper(files: any, BuildingMap: Map<string, any>, RoomList: Room[], ID: any ,
					   kind: InsightDatasetKind): Promise<any> {
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

	private buildingGeo(building: any): Promise<any> {
		return new Promise((resolve, reject) => {
			let encode = encodeURIComponent(building.address);
			let link = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team122/" + encode;
			// the http get call back function take reference from website
			// reference: https://nodejs.org/api/http.html#httprequesturl-options-callback
			http.get(link, (res) => {
				res.setEncoding("utf8");
				let rawData = "";
				res.on("data", (chunk) => {
					rawData += chunk;
				});
				res.on("end", () => {
					try {
						const parsedData = JSON.parse(rawData);
						building.lat = parsedData.lat;
						building.lon = parsedData.lon;
						return resolve (building);
					} catch (e) {
						return reject(new Error("Get lat and lon error"));
					}
				});
			}).on("error", (e) => {
				console.error(`Got error: ${e.message}`);
				return reject(new Error("Get link error"));
			});
		});
	}
}
