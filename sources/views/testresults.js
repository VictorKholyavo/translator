import {JetView} from "webix-jet";

export default class TestView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;

		return {
			view: "datatable",
			localId: "datatable",
			select: true,
			columns: [
				{id: "index", width: 50, header: "No"},
				{id: "date", width: 250, fillspace: true, header: _("Date")},
				{id: "result",fillspace: true, header: _("Result")}
			],
			url: "http://localhost:3013/testresults/all",
			save: {
				url: "rest->http://localhost:3013/testresults/all",
				updateFromResponse: true
			},
		};
	}
	$getDatatable() {
		return this.$$("datatable");
	}
	init() {
	}
}
