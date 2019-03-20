import {JetView} from "webix-jet";

export default class FormView extends JetView {
	config() {
		const authWindow = {
			rows: [
				{
					cols: [
						{
							view: "button",
							value: "Login",
							batch: "user",
							type: "form",
							click: () => {
								this.change_mode("authorization");
							},
						},
						{
							view: "button",
							value: "Registration",
							batch: "guest",
							type: "form",
							click: () => {
								this.change_mode("registration");
							}
						}
					]
				},
				{
					view: "form",
					localId: "form",
					scroll: false,
					visibleBatch:"b1",
					elements: [
						{
							view: "text",
							localId: "email",
							name: "email",
							label: "Email",
							batch: "b1"
						},
						{
							view: "text",
							localId: "username",
							name: "username",
							label: "Username",
							batch: "b2"
						},
						{
							view: "text",
							localId: "password",
							name: "password",
							label: "Password",
							batch: "b1"
						},
						{
							cols: [
								{
									view: "button",
									localId: "userButton",
									value: "Login",
									batch: "b1",
									click: () => {
										const values = this.$getForm().getValues();
										this.getData(values);
									}
								},
							]
						}
					],
					rules: {
						$all: webix.rules.isNotEmpty
					}
				}
			]
		};

		return {
			view: "window",
			localId: "authWindow",
			width: 600,
			position: "center",
			modal: true,
			head: {
				template: "Authorization",
				localId: "formTemplate"
			},
			body: authWindow,
			on: {
				onHide: () => {
					this.$getForm().clear();
					this.$getForm().clearValidation();
				}
			}
		};
	}
	change_mode(mode) {
		const formTemplate = this.$$("formTemplate");
		const userButton = this.$$("userButton");

		if (mode == "authorization") {
			formTemplate.define({template: "Authorization"});
			userButton.define({value: "Login"});
			this.$getForm().showBatch("b1");
		}
		else {
			formTemplate.define({template: "Registration"});
			userButton.define({value: "Register"});
			this.$getForm().showBatch("b2", true);
		}
		this.$getForm().clear();
		this.$getForm().clearValidation();
		userButton.refresh();
		formTemplate.refresh();
	}

	getData(values) {
		let form = this.$getForm();
		let authWindow = this.$authWindow();
		if (form.validate()) {
			if (!values.username) {
				webix.ajax().post("http://localhost:3013/users/login", values).then(function(response) {
					response = response.json();
					webix.storage.local.put("tokenOfUser", response);
					webix.message({ type:"success", text:"You are logged in" });
					authWindow.hide();
				}, function(err) {
					if (err.status == 403) {
						webix.message({ type:"error", text:"Неверный логин или пароль" });
						form.clear();
					}
				});
			}
			else {
				webix.ajax().post("http://localhost:3013/users/registration", values).then(function (response) {
					response = response.json();
					webix.storage.local.put("tokenOfUser", response);
					webix.message({ type:"success", text:"You are registered" });
					authWindow.hide();
				}, function (err) {
					webix.message({ type:"error", text: err.responseText });
				});
			}
		}
		else {
			webix.message({ type:"error", text:"Form data is invalid" });
		}
	}
	init() {
		let token = webix.storage.local.get("tokenOfUser");
		if (!token) {
			this.$$("authWindow").show();
		}
		webix.attachEvent("onBeforeAjax",
			(mode, url, data, request, headers) => {
				if (webix.storage.local.get("tokenOfUser")) {
					headers["authorization"] = webix.storage.local.get("tokenOfUser").token;
				}
			}
		);
	}
	$getForm() {
		return this.$$("form");
	}
	$authWindow() {
		return this.$$("authWindow");
	}
}
