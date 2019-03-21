import {JetView, plugins} from "webix-jet";

export default class TopView extends JetView{
	config() {
		const _ = this.app.getService("locale")._;

		const menu = {
			view: "menu",
			id:"top:menu",
			localId: "menu",
			css: "app_menu",
			width: 220, layout:"y", select:true,
			template: "<span class='webix_icon #icon#'></span> #value# ",
			data: [
				{ value: _("Start Page"), id:"start", icon:"wxi-columns" },
				{ value: _("Word Base"),	id:"wordbase",  icon:"wxi-pencil" },
				{ value: _("Test"),	id:"test",  icon:"wxi-pencil" },
				{ value: _("Test Results"),	id:"testresults",  icon:"wxi-pencil" }
			],
			on: {
				onAfterSelect:function(id){
					const header = this.$scope.$$("header");
					header.define({template: this.getItem(id).value});
					header.refresh();
				},
			},
		};

		const ui = {
			type: "clean",
			paddingX: 5,
			css: "app_layout",
			rows: [
				{
					paddingX: 5,
					paddingY: 10,
					rows: [
						{
							type: "header",
							view: "template",
							value: "#value#",
							localId: "header",
							css: "webix_dark mainHeader"
						},
						{
							css: "webix_shadow_medium",
							cols: [
								menu,
								{ $subview:true }
							]
						}
					]
				},
				{
					type: "wide",
					paddingY: 10,
					paddingX: 5,
					rows: []
				}
			]
		};
		return ui;
	}
	init(){
		this.use(plugins.Menu, "top:menu");

		webix.attachEvent("onBeforeAjax",
			function(mode, url, data, request, headers) {
				if (webix.storage.local.get("tokenOfUser")) {
					headers["authorization"] = webix.storage.local.get("tokenOfUser").token;
				}
			}
		);
	}
	urlChange() {
		let topView = this;
		webix.ajax().get("http://localhost:3013/users/status").then(function() {}, function (err) {
			if (err.status == 403) {
				topView.show("/top/start");
			}
		});
	}
}
