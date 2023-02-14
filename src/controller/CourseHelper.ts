export class Section {
	public readonly uuid: string;
	public readonly id: string;
	public readonly title: string;
	public readonly instructor: string;
	public readonly dept: string;
	public readonly year: number;
	public readonly avg: number;
	public readonly pass: number;
	public readonly fail: number;
	public readonly audit: number;

	constructor(
		id: string,
		Course: string,
		Title: string,
		Professor: string,
		Subject: string,
		Year: number,
		Avg: number,
		Audit: number,
		Pass: number,
		Fail: number
	) {
		this.uuid = id;
		this.id = Course;
		this.title = Title;
		this.instructor = Professor;
		this.dept = Subject;
		this.year = Year;
		this.avg = Avg;
		this.pass = Pass;
		this.fail = Fail;
		this.audit = Audit;
	}
}

export class Course {
	public sections: Section[] = [];
	public addSections(data: any): Promise<Section[]> {
		let sections: Section[];
		return new Promise((resolve, reject) => {
			try {
				let raredata = JSON.parse(data);
				// process each result in the result list
				for (const result in raredata.result) {
					try {
						if (
							(raredata.id ||
								raredata.Course ||
								raredata.Title ||
								raredata.Avg ||
								raredata.Professor ||
								raredata.Subject ||
								raredata.Year ||
								raredata.Audit ||
								raredata.Pass ||
								raredata.Fail) === undefined
						) {
							return reject(new Error("Missing field, invalid section!"));
						}
						// each section is formed into section name + content
						const section = new Section(
							raredata.id,
							raredata.Course,
							raredata.Title,
							raredata.Professor,
							raredata.Subject,
							raredata.Year,
							raredata.Avg,
							raredata.Audit,
							raredata.Pass,
							raredata.Fail
						);
						sections.push(section);
					} catch {
						return reject(new Error("Error when parsing sections for course!"));
					}
				}
				this.sections = sections;
				return resolve(this.sections);
			} catch {
				return reject(new Error("Error when parsing file, wrong/invalid/not JSON"));
			}
		});
	}
}
