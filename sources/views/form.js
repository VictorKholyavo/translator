import {JetView} from "webix-jet";

export default class FormView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;

		const authWindow = {
			rows: [
				{
					cols: [
						{
							view: "button",
							value: _("Login"),
							batch: "user",
							type: "form",
							click: () => {
								this.change_mode("authorization");
							},
						},
						{
							view: "button",
							value: _("Registration"),
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
							label: _("Username"),
							labelPosition: "left",
							batch: "b2"
						},
						{
							view: "text",
							localId: "password",
							name: "password",
							label: _("Password"),
							batch: "b1"
						},
						{
							cols: [
								{
									view: "button",
									localId: "userButton",
									value: _("Login"),
									batch: "b1",
									click: () => {
										const values = this.$getForm().getValues();
										// this.getData(values);
										this.onSubmit(values);
									}
								}
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
			localId: "window",
			width: 600,
			position: "center",
			modal: true,
			head: {
				template: _("Authorization"),
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
		const _ = this.app.getService("locale")._;
		const formTemplate = this.$$("formTemplate");
		const userButton = this.$$("userButton");

		if (mode == "authorization") {
			formTemplate.define({template: _("Authorization")});
			userButton.define({value: _("Login")});
			this.$getForm().showBatch("b1");
		}
		else {
			formTemplate.define({template: _("Registration")});
			userButton.define({value: _("Register")});
			this.$getForm().showBatch("b2", true);
		}
		this.$getForm().clear();
		this.$getForm().clearValidation();
		userButton.refresh();
		formTemplate.refresh();
	}

	showWindow(values, filled) {
		this.getRoot().show();
		this.onSubmit = function(data) {
			if (this.$getForm().validate()) {
				filled(data);
				this.$$("window").hide();
			}
			else {
				webix.message({ type:"error", text:"Form data is invalid" });
			}
		};
	}
	init() {
	}
	$getForm() {
		return this.$$("form");
	}
	$authWindow() {
		return this.$$("window");
	}
	hideForm() {
		this.getRoot().hide();
	}
}
