import {JetView} from "webix-jet";
import FormView from "./form";

export default class StartView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;
		const lang = this.app.getService("locale").getLang();

		return {
			cols: [
				{
					template: "Start page (Information about app)",
					css: "webix_shadow_medium app_start"
				},
				{
					rows: [
						{
							view: "toolbar",
							localId: "toolbar",
							css: "webix_dark",
							elements: [
								{
									view: "button",
									value: _("Logout"),
									batch: "user",
									css: {float: "right"},
									click: () => {
										this.logout();
										webix.storage.local.remove("tokenOfUser");
										this.refresh();
									}
								}
							]
						},
						{
							view: "segmented",
							width: 200,
							name: "lang",
							options: [
								{id: "en", value: "English" },
								{id: "ru", value: "Русский" }
							],
							click: () => {
								const langs = this.app.getService("locale");
								const value = this.getRoot().queryView({ name:"lang" }).getValue();
								langs.setLang(value);
							},
							value: lang,
						},
						{
							view: "template",
							template: () => {
								if (this.getUserData()) {
									return "Hello, "+ this.getUserData().username +"!";
								}
								else return "You must be logged to see your personal information";
							},
							localId: "template",
							width: 300
						},
					]
				}
			],
		};
	}
	getUserData() {
		let userData = webix.storage.local.get("tokenOfUser");
		return userData;
	}
	logout() {
		let token = webix.storage.local.get("tokenOfUser");
		webix.ajax().post("http://localhost:3013/users/logout", token).then(function(response) {
			response = response.json();
			webix.message("Goodbye, " + response.username);
		});
	}
	init() {
		let token = webix.storage.local.get("tokenOfUser");

		if (!token) {
			this.authorizationWindow();
		}
	}
	authorizationWindow() {
		let startPage = this;
		this.ui(FormView).showWindow("", function(data) {
			if (!data.username) {
				webix.ajax().post("http://localhost:3013/users/login", data).then(function(response) {
					response = response.json();
					webix.storage.local.put("tokenOfUser", response);
					webix.message({ type:"success", text:"You are logged in" });
					startPage.refresh();
				}, function(err) {
					if (err.status == 403) {
						webix.message({ type:"error", text:"Неверный логин или пароль" });
					}
				});
			}
			else {
				webix.ajax().post("http://localhost:3013/users/registration", data).then(function (response) {
					response = response.json();
					webix.storage.local.put("tokenOfUser", response);
					webix.message({ type:"success", text:"You are registered" });
					startPage.refresh();
				}, function (err) {
					webix.message({ type:"error", text: err.responseText });
				});
			}

		});
	}
	$getTemplate() {
		return this.$$("template");
	}
}
