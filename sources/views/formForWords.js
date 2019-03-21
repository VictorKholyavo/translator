import {JetView} from "webix-jet";
import {partOfSpeech} from "models/partOfSpeech";

export default class FormforWordsView extends JetView {
	config() {
		const _ = this.app.getService("locale")._;

		const form = {
			view: "form",
			localId: "form",
			scroll: false,
			elements: [
				{
					view: "text",
					name: "english",
					label: _("English")
				},
				{
					view: "text",
					name: "russian",
					label: _("Russian")
				},
				{
					view: "richselect",
					name: "partOfSpeech",
					label: _("Part of speech"),
					options: partOfSpeech
				},
				{
					cols: [
						{
							view: "button",
							localId: "updateButton",
							value: _("Save"),
							click: () => {
								const values = this.$getForm().getValues();
								this.onSubmit(values);
							}
						},
						{
							view: "button",
							localId: "closeButton",
							value: _("Close"),
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
			localId: "formForWords",
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
			formTemplate.define({template: _("Edit word")});
		}
		else {
			formTemplate.define({template: _("Add word")});
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
		this.$$("formForWords").hide();
	}
}
