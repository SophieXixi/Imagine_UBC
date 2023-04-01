import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect} from "chai";
import request, {Response} from "supertest";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import {response} from "express";
import * as fs from "fs-extra";

describe("Server", () => {
	let facade: InsightFacade;
	let server: Server;

	before(async () => {
		clearDisk();
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		try {
			await server.start();
			console.log("Server started successfully.");
		} catch (error) {
			console.error("Error starting server:", error);
		}
	});

	after(async () => {
		// TODO: stop server here once!
		await server.stop();
	});

	beforeEach(() => {
		// might want to add some process logging here to keep track of what's going on
	});

	afterEach(() => {
		// might want to add some process logging here to keep track of what's going on
		// clearDisk();
	});

	it("GET nothing", async () => {
		try {
			return request("http://localhost:4321")
				.get("/datasets")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.deep.equal([]);
				})
				.catch(() => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	// Sample on how to format PUT requests
	it("PUT: successful sections", async () => {
		let dataset = fs.readFileSync("test/resources/archives/courses.zip");
		try {
			return request("http://localhost:4321")
				.put("/dataset/course/sections")
				.send(dataset)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.deep.equal(["course"]);
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("GET", async () => {
		try {
			return request("http://localhost:4321")
				.get("/datasets")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.deep.equal([{id: "course", kind: "sections", numRows: 2}]);
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("PUT: successful rooms", async () => {
		let dataset = fs.readFileSync("test/resources/archives/small table.zip");
		try {
			return request("http://localhost:4321")
				.put("/dataset/room/rooms")
				.send(dataset)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.deep.equal(["course", "room"]);
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("PUT: fail - invalid id", async () => {
		let dataset = fs.readFileSync("test/resources/archives/courses.zip");
		try {
			return request("http://localhost:4321")
				.put("/dataset/_/sections")
				.send(dataset)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(400);
					// more assertions here
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("PUT: fail - duplicate id", async () => {
		let dataset = fs.readFileSync("test/resources/archives/courses.zip");
		try {
			return request("http://localhost:4321")
				.put("/dataset/course/sections")
				.send(dataset)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(400);
					// more assertions here
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("PUT: fail - invalid kind", async () => {
		let dataset = fs.readFileSync("test/resources/archives/courses.zip");
		try {
			return request("http://localhost:4321")
				.put("/dataset/course2/section")
				.send(dataset)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(400);
					// more assertions here
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("GET 2", async () => {
		try {
			return request("http://localhost:4321")
				.get("/datasets")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.deep.equal([
						{id: "course", kind: "sections", numRows: 2},
						{id: "room", kind: "rooms", numRows: 41},
					]);
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("DELETE: successful", async () => {
		try {
			return request("http://localhost:4321")
				.delete("/dataset/course")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.deep.equal("course");
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("GET after delete 1", async () => {
		try {
			return request("http://localhost:4321")
				.get("/datasets")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.deep.equal([{id: "room", kind: "rooms", numRows: 41}]);
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("DELETE: fail - not exist id", async () => {
		try {
			return request("http://localhost:4321")
				.delete("/dataset/course")
				.then((res: Response) => {
					expect(res.status).to.be.equal(404);
					// more assertions here
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("DELETE: fail - invalid id", async () => {
		try {
			return request("http://localhost:4321")
				.delete("/dataset/__")
				.then((res: Response) => {
					expect(res.status).to.be.equal(400);
					// more assertions here
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("PUT: successful full sections", async () => {
		let dataset = fs.readFileSync("test/resources/archives/pair.zip");
		try {
			return request("http://localhost:4321")
				.put("/dataset/sections/sections")
				.send(dataset)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					console.log(res.status);
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.deep.equal(["room", "sections"]);
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});

	it("POST: successful query", async () => {
		let data = fs.readFileSync("test/rest/valid.json", "utf8");
		let query = JSON.parse(data);
		const text = fs.readFileSync("test/rest/valid_res.json", "utf8");
		let result = JSON.parse(text);
		try {
			return request("http://localhost:4321")
				.post("/query")
				.send(query)
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
					expect(res.body.result).to.deep.equal(result);
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});
});
