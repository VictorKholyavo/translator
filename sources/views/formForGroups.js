import {JetView} from "webix-jet";

export default class FormforGroupsView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;

		const form = {
			view: "form",
			localId: "form",
			scroll: false,
			elements: [
				{
					view: "text",
					name: "title",
					label: _("Title")
				},
				{
					cols: [
						{
							view: "button",
							localId: "updateButton",
							value: "Save",
							click: () => {
								const values = this.$getForm().getValues();
								this.onSubmit(values);
							}
						},
						{
							view: "button",
							localId: "closeButton",
							value: "Close",
							click: function () {
								this.getTopParentView().hide();
							}
						}
					]
				}
			],
			rules: {
				$all: webix.rules.isNotEmpty
			}
		};

		return {
			view: "window",
			localId: "formForGroups",
			width: 600,
			position: "center",
			modal: true,
			head: {
				template: " ",
				localId: "formTemplate"
			},
			body: form,
			on: {
				onHide: () => {
					this.$getForm().clear();
					this.$getForm().clearValidation();
				}
			}
		};
	}
	showWindow(values, filled) {
		const _ = this.app.getService("locale")._;

		let formTemplate = this.$$("formTemplate");
		this.getRoot().show();
		if (values) {
			this.$getForm().setValues(values);
			formTemplate.define({template: _("Edit Group")});
		}
		else {
			formTemplate.define({template: _("Add Group")});
		}
		formTemplate.refresh();
		this.onSubmit = function(data) {
			if (this.$getForm().validate()) {
				filled(data);
			}
		};
	}
	init() {
	}
	$getForm() {
		return this.$$("form");
	}

	hideOrNotHide() {
		webix.message("All is correct");
		this.$$("formForGroups").hide();
	}
}
