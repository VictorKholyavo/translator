import {JetView} from "webix-jet";

let results = [];

export default class TestView extends JetView {
	config(){
		const _ = this.app.getService("locale")._;

		return {
			cols: [
				{
					rows: [
						{
							view:"list",
							localId: "list",
							width: 300,
							select: true,
							url: "http://localhost:3013/groups",
							save: {
								url: "rest->http://localhost:3013/groups",
								updateFromResponse: true
							},
							type: {
								height: 65,
								template: (obj) => {
									return "<div class='rowOfList'><span>Title: "+ obj.title +", </span><span>amount of words: "+ obj.words +"</span></div><div class='rowOfList'><span>"+ obj.date +"</span></div>";
								},
							},
							on: {
								onItemClick:(id) => {
									this.setParam("group", id, true);
								}
							},
							css:"webix_shadow_medium"
						},
						{
							view: "button",
							value: _("Generate test"),
							localId: "generateButton",
							type: "form",
							click: () => {
								let id = this.getParam("group");
								let datatable = this.$getDatatable();
								if (id) {
									webix.ajax().post("http://localhost:3013/test", {mode: "generate", groupId: id}).then(function(response) {
										response = response.json();
										datatable.clearAll();
										datatable.parse(response);
									});
									this.$$("generateButton").disable();
									this.$$("list").disable();
								}
								else {
									webix.message({ type:"error", text: "You should choose a group"});
								}
							}
						}
					]
				},
				{
					rows: [
						{
							view: "datatable",
							localId: "datatable",
							columns: [
								{id: "english", fillspace: true, header: _("English")},
								{id: "partOfSpeech", hidden: true, fillspace: true, header: "Part of Speech"},
								{id: "option1", fillspace: true, header: _("Option 1"), template: function(obj) {
									if (obj.option1) {
										return "<div class='webix_el_button'><button class='webixtype_base'> "+ obj.option1 +" </button></div>";
									}
									else return "нет вариантов";
								}},
								{id: "option2", fillspace: true, header: _("Option 2"), template: function(obj) {
									if (obj.option2) {
										return "<div class='webix_el_button'><button class='webixtype_base'> "+ obj.option2 +" </button></div>";
									}
									else return "нет вариантов";
								}},
								{id: "option3", fillspace: true, header: _("Option 3"), template: function(obj) {
									if (obj.option3) {
										return "<div class='webix_el_button'><button class='webixtype_base'> "+ obj.option3 +" </button></div>";
									}
									else return "нет вариантов";
								}},
								{id: "option4", fillspace: true, header: _("Option 4"), template: function(obj) {
									if (obj.option4) {
										return "<div class='webix_el_button'><button class='webixtype_base'> "+ obj.option4 +" </button></div>";
									}
									else return "нет вариантов";
								}},
							],
							onClick:{
								webixtype_base: (e, id) => {
									let value = this.$getDatatable().getText(id, id.column);
									let question = this.$getDatatable().getText(id, "english");
									let partOfSpeech = this.$getDatatable().getText(id, "partOfSpeech");
									value = value.split(" ");
									let answer = {id: id.row, partOfSpeech: partOfSpeech, question: question, value: value[3]};
									this.addAnswer(answer, id, id.column);
								}
							},
						},
						{
							view: "button",
							type: "form",
							value: _("Check results"),
							click: () => {
								let id = this.getParam("group");
								results = JSON.stringify(results);
								if (id && results) {
									webix.ajax().post("http://localhost:3013/test", {groupId: id, mode: "check", test: results}).then(function(response) {
										response = response.json();
										webix.message({ type:"success", height: 100, text: "Your mark: " + response });
									});
									this.refresh();
								}
								results = [];
							}
						}
					]
				},
			]
		};
	}
	$getDatatable() {
		return this.$$("datatable");
	}
	addAnswer(answer, id, column) {
		if (!results[0]) {
			results.push(answer);
		}
		else {
			for (let i = 0; i < results.length; i++) {
				if (results[i].question == answer.question) {
					results[i] = answer;
					break;
				}
			}
			results.push(answer);
		}
		this.$getDatatable().addCellCss(id, column, "button_lightblue");
	}
	init() {
	}
}
