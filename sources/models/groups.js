export const groups = new webix.DataCollection({
	url: "http://localhost:3013/groups",
	save: {
		url: "rest->http://localhost:3013/groups",
		updateFromResponse: true
	}
});
