import {JetView} from "webix-jet";
import FormForGroupsView from "./formForGroups";
import FormForWordsView from "./formForWords";
import {partOfSpeech} from "models/partOfSpeech";

export default class DataView extends JetView{
	config() {
		const _ = this.app.getService("locale")._;

		return {
			cols: [
				{
					rows: [
						{
							view: "list",
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
								},
								onDataUpdate: ()=> {
									this.$$("datatable").refresh();
								}
							},
							css:"webix_shadow_medium"
						},
						{
							view: "button",
							value: _("Add Group"),
							type: "form",
							click: () => {
								const form = this.FormforGroupsView;
								const list = this.$$("list");
								this.FormforGroupsView.showWindow("", function(data) {
									list.add(data);
									form.hideOrNotHide();
								});
							}
						},
						{
							view: "button",
							value: _("Delete group"),
							type: "form",
							click: () => {
								let groupId = this.getParam("group");
								if (groupId) {
									this.$getList().remove(groupId);
								}
								else {
									webix.message({ type:"error", text:"Choose a group to delete" });
								}
							}
						},
					]
				},
				{
					rows: [
						{
							view: "datatable",
							localId: "datatable",
							select: true,
							url: "http://localhost:3013/groups/words",
							save: {
								url: "rest->http://localhost:3013/groups/words",
								updateFromResponse: true
							},
							columns: [
								{id: "english", header: _("English"), fillspace: true},
								{id: "russian", header: _("Russian"), fillspace: true},
								{id: "partOfSpeech", header: _("Part of speech"), fillspace: true},
							]
						},
						{
							view: "button",
							value: _("Add word"),
							type: "form",
							click: () => {
								let groupId = this.getParam("group");
								const list = this.$$("list");
								const form = this.FormForWordsView;
								let wordbase = this;
								if (groupId) {
									this.FormForWordsView.showWindow("", function(word) {
										word.group = groupId;
										word.partOfSpeech = partOfSpeech.getItem(word.partOfSpeech).value;
										list.updateItem(groupId, word);
										wordbase.refresh();
										form.hideOrNotHide();
									});
								}
								else {
									webix.message({ type:"error", text:"Choose a group to add a word" });
								}
							}
						},
						{
							view: "button",
							value: _("Export to Excel"),
							type: "form",
							click: () => {
								webix.toExcel(this.$getDatatable());
							}
						}
					]
				}
			]
		};
	}
	getUserData() {
		let userData = webix.storage.local.get("tokenOfUser");
		return userData;
	}
	$getList() {
		return this.$$("list");
	}
	$getDatatable() {
		return this.$$("datatable");
	}
	init() {
		this.FormforGroupsView = this.ui(FormForGroupsView);
		this.FormForWordsView = this.ui(FormForWordsView);
		let datatable = this.$getDatatable();
		let list = this.$getList();
		list.attachEvent("onDataUpdate",  () => {
			list.refresh();
			datatable.refresh();
		});
	}
	urlChange() {
		let id = this.getParam("group");
		this.$getDatatable().filter(
			function(obj){
				return obj.groupId == id;
			}
		);
	}
}
