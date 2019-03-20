export const words = new webix.DataCollection({
	url: "http://localhost:3012/words",
	save: {
		url: "rest->http://localhost:3012/words",
		updateFromResponse: true
	}
});
// 
// films.refresh = function() {
// 	this.clearAll();
// 	this.load(this.config.url);
// };
