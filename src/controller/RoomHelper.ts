export class Room {
	public fullname: string;
	public shortname: string;

	public address: string;
	public lat: number;
	public lon: number;
	public href: string;
	public number: string;
	public name: string;
	public seats: number;
	public type: string;
	public furniture: string;

	constructor(
		fullname: string,
		shortname: string,
		address: string,
		lat: number,
		lon: number,
		href: string,
		number: string,
		name: string,
		seats: number,
		type: string,
		furniture: string
	) {
		this.fullname = fullname;
		this.shortname = shortname;
		this.address = address;
		this.lat = lat;
		this.lon = lon;
		this.href = href;
		this.number = number;
		this.name = name;
		this.furniture = name;
		this.seats = seats;
		this.type = type;
		this.furniture = furniture;
	}
}

export class Building {
	public fullname: string;
	public shortname: string;

	public address: string;
	public lat: number;
	public lon: number;
	public href: string;

	constructor(
		fullname: string,
		shortname: string,
		address: string,
		lat: number,
		lon: number,
		href: string
	) {
		this.fullname = fullname;
		this.shortname = shortname;
		this.address = address;
		this.lat = lat;
		this.lon = lon;
		this.href = href;
	}


}

