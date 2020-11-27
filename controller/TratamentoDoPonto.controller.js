sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./Popover2",
	"./Popover1",
	"./Dialog1",
	"./Dialog2",
	"./Dialog4",
	"./Dialog5",
	"./ExcluirMarcacoes",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/FilterOperator",
	"../webServices/connections"
], function(Controller, Popover2, Popover1, Dialog1, Dialog2, Dialog4, Dialog5, ExcluirMarcacoes, MessageBox,
	MessageToast, FilterOperator, connections) {
	"use strict";

	return Controller.extend("com.neo.ZODHR_SS_TIME_C.controller.TratamentoDoPonto", {
		table: "",
		onClearAllFilter: function(oEvent) {
			for (var i = 0; i < oEvent.getParameters().selectionSet.length; i++) {
				oEvent.getParameters().selectionSet[i].setValue("");
			}
		},
		reloadAppData: function(oData) {
			this.getView().setBusy(false);
			sap.ui.core.BusyIndicator.hide();
			this.getPointTreatmentData();
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("TelaEditarMarcacoesColaborador", "MarksSaved", true);

		},
		sendCreateModel: function(obj, param) {
			var me = this;
			this.getView().setBusy(true);
			connections.createModel(param, obj,
				function(oData, oResponse) {
					me.getView().setBusy(false);
					sap.ui.core.BusyIndicator.hide();
					var msgText = "";
					//Tiago
					switch (true) {
						case oResponse.headers.location.includes("CabecalhoDeepJustPadraoSet"):
							msgText = "Ocorrências tratadas com sucesso!";
							break;
						case oResponse.headers.location.includes("JustificarSet"):
							msgText = "Justificativa Realizada com sucesso!";
							break;
						case oResponse.headers.location.includes("HorarioPadraoSet"):
							msgText = "Horário padrão realizado com sucesso!";
							break;
						case oResponse.headers.location.includes("CabecalhoTratamentoPontoSet"):
							msgText = "Marcações realizadas com sucesso!";
							break;
						case oResponse.headers.location.includes("BancoHorasSet"):
							msgText = "Horas de Banco inserido com sucesso!";
							break;
						case oResponse.headers.location.includes("HorasExtrasSet"):
							msgText = "Horas Extra inserida com sucesso!";
							break;
						default:
							msgText = "Alteração Realizada com sucesso!";
					}

					var dialog = new sap.m.Dialog({
						title: "Successo",
						type: "Message",
						state: "Success",
						content: new sap.m.Text({
							text: msgText
						}),
						beginButton: new sap.m.Button({
							text: "OK",
							press: function() {
								dialog.close();
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});

					dialog.open();
					me.reloadAppData(oResponse);
				},
				function(err) {
					me.getView().setBusy(false);
					sap.ui.core.BusyIndicator.hide();
					var dialog = new sap.m.Dialog({
						title: "Erro",
						type: "Message",
						state: "Error",
						content: new sap.m.Text({
							text: JSON.parse(err.responseText).error.message.value
						}),
						beginButton: new sap.m.Button({
							text: "OK",
							press: function() {
								dialog.close();
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});

					dialog.open();
				}
			);
		},

		sendUpdateModel: function(obj, param) {
			var me = this;
			this.getView().setBusy(true);
			connections.updateModel(param, obj,
				function(oData, oResponse) {
					me.getView().setBusy(false);
					sap.ui.core.BusyIndicator.hide();
					var msgText = "";

					switch (true) {
						case oResponse.headers.location.includes("BancoHorasSet"):
							msgText = "Horas de Banco inserido com sucesso!";
							break;
						case oResponse.headers.location.includes("HorasExtrasSet"):
							msgText = "Horas Extra inserida com sucesso!";
							break;
					}

					var dialog = new sap.m.Dialog({
						title: "Successo",
						type: "Message",
						state: "Success",
						content: new sap.m.Text({
							text: msgText
						}),
						beginButton: new sap.m.Button({
							text: "OK",
							press: function() {
								dialog.close();
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});

					dialog.open();
					me.reloadAppData(oResponse);
				},
				function(err) {

					var body = JSON.parse(err.response.body);
					var message = body.error.message.value;

					me.getView().setBusy(false);
					sap.ui.core.BusyIndicator.hide();
					var dialog = new sap.m.Dialog({
						title: "Erro",
						type: "Message",
						state: "Error",
						content: new sap.m.Text({
							text: message
						}),
						beginButton: new sap.m.Button({
							text: "OK",
							press: function() {
								dialog.close();
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});

					dialog.open();

				}
			);
			me.getView().setBusy(false);
			sap.ui.core.BusyIndicator.hide();
			me.reloadAppData();
		},

		changeFooterButtonsState: function(state) {
			//this.byId("overTime").setEnabled(state);
			//this.byId("bankHour").setEnabled(state);
			this.byId("justification").setEnabled(state);
			this.byId("editMarks").setEnabled(state);
			this.byId("excluirMarks").setEnabled(state);
		},

		_onPointTreatmentTableSelectionChange: function(oEvent) {

			if (oEvent) {
				this.table = oEvent.getSource();
			} else {
				this.table = this.byId("PointTreatmentTable");
			}
			if (this.table.getSelectedItems().length) {
				this.changeFooterButtonsState(true);

				if (this.table.getSelectedItems().length > 1) {
					this.byId("editMarks").setEnabled(false);
					this.byId("excluirMarks").setEnabled(false);
					this.byId("justification").setEnabled(false);
				}
			} else {
				this.changeFooterButtonsState(false);
			}

			var modelTable = oEvent.oSource.oPropagatedProperties.oModels.pointTreatmentData.oData;

			for (var i = 0; i < modelTable.length; i++) {

				for (var l = 0; l < this.table.getSelectedItems().length; l++) {
					var checkBoxMarcado = this.table.getSelectedItems()[l].sId;
					checkBoxMarcado = checkBoxMarcado.substring(40);
					checkBoxMarcado = parseInt(checkBoxMarcado, 10);
					if (checkBoxMarcado === i) {
						var itemCompara = oEvent.oSource.oPropagatedProperties.oModels.pointTreatmentData.oData[i].AGUARD_APROV;
						if (itemCompara === true) {
							this.byId("editMarks").setEnabled(false);
							this.byId("justification").setEnabled(false);
							//this.byId("standardTime").setEnabled(false);
						}
						var flagMarcacao = oEvent.oSource.oPropagatedProperties.oModels.pointTreatmentData.oData[i].MARCACOES;
						if (flagMarcacao === "") {
							this.byId("excluirMarks").setEnabled(false);
						}
						if (modelTable[i].DESCR_OCOR === "Horas Extras a Definir") {
							this.byId("justification").setEnabled(false);
						}
					}
				}
			}

		},

		filterUnidade: function(unidade) {
			for (var i = 0; i < this.tableData.length; i++) {
				if (unidade && this.tableData[i].WERKS_DESC !== unidade) {
					this.tableData[i].visible = false;
				}
			}

		},
		filterPersonalNumber: function(numeroPessoal) {
			for (var i = 0; i < this.tableData.length; i++) {
				if (numeroPessoal && this.tableData[i].PERNR !== numeroPessoal) {
					this.tableData[i].visible = false;
				}
			}

		},
		filterName: function(nome) {
			for (var i = 0; i < this.tableData.length; i++) {
				if (nome && this.tableData[i].NOME !== nome) {
					this.tableData[i].visible = false;
				}
			}

		},
		filterUnidadeOrganizacional: function(unidadeOrganizacional) {
			for (var i = 0; i < this.tableData.length; i++) {
				if (unidadeOrganizacional && this.tableData[i].ORGEH_DESC !== unidadeOrganizacional) {
					this.tableData[i].visible = false;
				}
			}

		},
		filterCentroCusto: function(centroCusto) {
			for (var i = 0; i < this.tableData.length; i++) {
				if (centroCusto && this.tableData[i].KOSTL !== centroCusto) {
					this.tableData[i].visible = false;
				}
			}

		},
		filterGrupoEmpregados: function(GrupoDeEmpregados) {
			for (var i = 0; i < this.tableData.length; i++) {
				if (GrupoDeEmpregados && this.tableData[i].PERSG_DESC !== GrupoDeEmpregados) {
					this.tableData[i].visible = false;
				}
			}

		},
		filterTipoDeEquipe: function(TipoDeEquipe) {
			for (var i = 0; i < this.tableData.length; i++) {
				if (TipoDeEquipe && this.tableData[i].TIPO_EQUIPE !== TipoDeEquipe) {
					this.tableData[i].visible = false;
				}
			}

		},
		onSearch: function(oEvent) {
			if (oEvent) {
				this.oSearchEvent = oEvent.getParameters();
				oEvent = oEvent.getParameters();
			}
			for (var i = 0; i < this.tableData.length; i++) {
				this.tableData[i].visible = true;
			}
			this.setPointTreatmentData(this.tableData);

			var unidade = oEvent.selectionSet[0].getValue();
			this.filterUnidade(unidade);

			var numeroPessoal = oEvent.selectionSet[5].getValue();
			this.filterPersonalNumber(numeroPessoal);

			var nome = oEvent.selectionSet[6].getValue();
			this.filterName(nome);

			var unidadeOrganizacional = oEvent.selectionSet[1].getValue();
			this.filterUnidadeOrganizacional(unidadeOrganizacional);

			var centroCusto = oEvent.selectionSet[2].getValue();
			this.filterCentroCusto(centroCusto);

			var grupoEmpregados = oEvent.selectionSet[3].getValue();
			this.filterGrupoEmpregados(grupoEmpregados);

			var TipoDeEquipe = oEvent.selectionSet[4].getValue();
			this.filterTipoDeEquipe(TipoDeEquipe);

			this.setPointTreatmentData(this.tableData);

			this._onPointTreatmentTableSelectionChange();
		},
		getSelectedPointTreatmentItems: function() {
			var aItems = [];
			var selectedItems = this.table.getSelectedItems();
			if (selectedItems.length) {
				for (var i = 0; i < selectedItems.length; i++) {
					var bindingContext = selectedItems[i].getBindingContext("pointTreatmentData");
					var model = bindingContext.getModel().getData();
					var path = bindingContext.getPath();
					var index = parseInt(path.substring(path.lastIndexOf("/") + 1, path.length), 10);
					var item = model[index];
					aItems.push(item);
				}
			}
			for (var i = 0; i < aItems.length; i++) {
				delete aItems[i].DATADISPLAY;
				delete aItems[i].__metadata;
				delete aItems[i].visible;
			}
			return aItems;

		},
		getHeaderData: function() {

			var stringParam = "/CabecalhoTratamentoPontoSet('true')";
			var aFilters = [];
			var me = this;
			connections.consumeModel(
				stringParam,
				function(oData, oResponse) {
					me.setHeaderData(oData);

				},
				function(err) {
					var dialog = new sap.m.Dialog({
						title: "Erro",
						type: "Message",
						state: "Error",
						content: new sap.m.Text({
							text: "Não foi possível carregar os dados"
						}),
						beginButton: new sap.m.Button({
							text: "OK",
							press: function() {
								dialog.close();
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});

					dialog.open();
				}, "", aFilters
			);

		},
		setHeaderData: function(oData) {
			var json = new sap.ui.model.json.JSONModel();
			json.setSizeLimit(999999);
			json.setData(oData);
			this.getView().setModel(json, "headerData");
		},
		getPointTreatmentData: function() {
			var stringParam = "/TratamentoDoPontoSet";
			var aFilters = [];
			var me = this;
			this.getView().setBusy(true);
			connections.consumeModel(
				stringParam,
				function(oData, oResponse) {
					me.getView().setBusy(false);
					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].visible = true;
						oData.results[i].DATADISPLAY = oData.results[i].DT_OCOR.substring(6, 8) + "/" + oData.results[i].DT_OCOR.substring(4, 6) + "/" +
							oData.results[i].DT_OCOR.substring(0, 4);
					}
					me.setPointTreatmentData(oData.results);
					me.setFilterData(oData.results);
					if (me.oSearchEvent) {
						me.onSearch(me.oSearchEvent);
					}

				},
				function(err) {
					me.getView().setBusy(false);
					var dialog = new sap.m.Dialog({
						title: "Erro",
						type: "Message",
						state: "Error",
						content: new sap.m.Text({
							text: "Não foi possível carregar os dados"
						}),
						beginButton: new sap.m.Button({
							text: "OK",
							press: function() {
								dialog.close();
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});

					dialog.open();
				}, "", aFilters
			);
		},
		setFilterData: function(oData) {
			var numeroPessoal = [];
			for (var i = 0; i < oData.length; i++) {
				numeroPessoal.push(oData[i].PERNR);
			}
			var aux = {};
			numeroPessoal.forEach(function(i) {
				if (!aux[i]) {
					aux[i] = true;
				}
				numeroPessoal = Object.keys(aux);
			});
			var json = new sap.ui.model.json.JSONModel();
			json.setData(numeroPessoal);
			this.getView().setModel(json, "numeroPessoalData");

			var nome = [];
			for (i = 0; i < oData.length; i++) {
				nome.push(oData[i].NOME);
			}
			aux = {};
			nome.forEach(function(i) {
				if (!aux[i]) {
					aux[i] = true;
				}
				nome = Object.keys(aux);
			});
			json = new sap.ui.model.json.JSONModel();
			json.setData(nome);
			this.getView().setModel(json, "nomeData");

			var unidadeOrganizacional = [];
			for (i = 0; i < oData.length; i++) {
				unidadeOrganizacional.push(oData[i].ORGEH_DESC);
			}
			aux = {};
			unidadeOrganizacional.forEach(function(i) {
				if (!aux[i]) {
					aux[i] = true;
				}
				unidadeOrganizacional = Object.keys(aux);
			});
			json = new sap.ui.model.json.JSONModel();
			json.setData(unidadeOrganizacional);
			this.getView().setModel(json, "unidadeOrganizacionalData");

			var CentroCusto = [];
			for (i = 0; i < oData.length; i++) {
				CentroCusto.push(oData[i].KOSTL);
			}
			aux = {};
			CentroCusto.forEach(function(i) {
				if (!aux[i]) {
					aux[i] = true;
				}
				CentroCusto = Object.keys(aux);
			});
			json = new sap.ui.model.json.JSONModel();
			json.setData(CentroCusto);
			this.getView().setModel(json, "centroCustoData");

			var GrupoDeEmpregados = [];
			for (i = 0; i < oData.length; i++) {
				GrupoDeEmpregados.push(oData[i].PERSG_DESC);
			}
			aux = {};
			GrupoDeEmpregados.forEach(function(i) {
				if (!aux[i]) {
					aux[i] = true;
				}
				GrupoDeEmpregados = Object.keys(aux);
			});
			json = new sap.ui.model.json.JSONModel();
			json.setData(GrupoDeEmpregados);
			this.getView().setModel(json, "grupoDeEmpregadosData");

			var TipoDeEquipe = [];
			for (i = 0; i < oData.length; i++) {
				TipoDeEquipe.push(oData[i].TIPO_EQUIPE);
			}
			aux = {};
			TipoDeEquipe.forEach(function(i) {
				if (!aux[i]) {
					aux[i] = true;
				}
				TipoDeEquipe = Object.keys(aux);
			});
			json = new sap.ui.model.json.JSONModel();
			json.setData(TipoDeEquipe);
			this.getView().setModel(json, "tipoDeEquipeData");

			var Unidade = [];
			for (i = 0; i < oData.length; i++) {
				Unidade.push(oData[i].WERKS_DESC);
			}
			aux = {};
			Unidade.forEach(function(i) {
				if (!aux[i]) {
					aux[i] = true;
				}
				Unidade = Object.keys(aux);
			});
			json = new sap.ui.model.json.JSONModel();
			json.setData(Unidade);
			this.getView().setModel(json, "unidadeData");
		},
		setPointTreatmentData: function(oData) {
			this.tableData = oData;
			var displayData = this.organizeDisplayData(oData);
			var json = new sap.ui.model.json.JSONModel();
			json.setData(displayData);
			this.getView().setModel(json, "pointTreatmentData");
			this.enableButtons(oData);
			this._onPointTreatmentTableSelectionChange();

		},
		organizeDisplayData: function(oData) {
			var displayData = [];
			for (var i = 0; i < oData.length; i++) {
				if (oData[i].visible) {
					displayData.push(oData[i]);
				}

				if (oData[i].AGUARD_APROV === true) {
					//this.getView().byId("PointTreatmentTable").mAggregations.items[0].mProperties.selected
					// testando
					// this.getView().byId("__item0-__xmlview0--PointTreatmentTable-0-selectMulti-CbBg").setEditable(false);
				}
			}
			return displayData;
		},
		getBancoDeHorasData: function() {
			var stringParam = "/BancoDeHorasSet";
			var aFilters = [];
			var me = this;
			connections.consumeModel(
				stringParam,
				function(oData, oResponse) {
					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].DATADISPLAY = oData.results[i].DT_OCOR.substring(4, 6) + "/" +
							oData.results[i].DT_OCOR.substring(0, 4);
					}
					me.setBancoDeHorasData(oData.results);
				},
				function(err) {
					var dialog = new sap.m.Dialog({
						title: "Erro",
						type: "Message",
						state: "Error",
						content: new sap.m.Text({
							text: "Não foi possível carregar dados de banco de horas"
						}),
						beginButton: new sap.m.Button({
							text: "OK",
							press: function() {
								dialog.close();
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});

					dialog.open();
				}, "", aFilters
			);
		},
		setBancoDeHorasData: function(oData) {
			var json = new sap.ui.model.json.JSONModel();
			json.setData(oData);
			this.getView().setModel(json, "bancoDeHorasData");
		},
		_onLinkPress: function(oEvent) {
			var selectedBH = oEvent.getSource().getParent().getBindingContext("bancoDeHorasData").getObject();
			this.getSaldoBHMesData(selectedBH);
			var sPopoverName = "Popover2";
			this.mPopovers = this.mPopovers || {};
			var oPopover = this.mPopovers[sPopoverName];

			if (!oPopover) {
				oPopover = new Popover2(this.getView());
				this.mPopovers[sPopoverName] = oPopover;

				oPopover.getControl().setPlacement("Auto");
			}

			var oSource = oEvent.getSource();

			oPopover.open(oSource);
		},
		getSaldoBHMesData: function(item) {
			var stringParam = "/SaldoBHMesSet";
			var aFilters = [];

			var oFilter = new sap.ui.model.Filter({
				path: "PERNR",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: item.PERNR
			});
			aFilters.push(oFilter);

			var oFilterWerks = new sap.ui.model.Filter({
				path: "WERKS",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: item.WERKS
			});
			aFilters.push(oFilterWerks);

			var me = this;
			connections.consumeModel(
				stringParam,
				function(oData, oResponse) {
					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].DATUM = oData.results[i].DATUM.substr(6, 2) + "/" + oData.results[i].DATUM.substr(4, 2) + "/" + oData.results[
							i].DATUM.substr(0, 4);
					}
					me.setSaldoBHMesData(oData.results);
				},
				function(err) {
					var dialog = new sap.m.Dialog({
						title: "Erro",
						type: "Message",
						state: "Error",
						content: new sap.m.Text({
							text: "Não foi possível carregar saldo de banco de horas"
						}),
						beginButton: new sap.m.Button({
							text: "OK",
							press: function() {
								dialog.close();
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});

					dialog.open();
				}, "", aFilters
			);
		},
		setSaldoBHMesData: function(oData) {
			var json = new sap.ui.model.json.JSONModel();
			json.setData(oData);
			this.getView().setModel(json, "saldoBHMesData");
		},

		_onOverTimeButtonPress: function _onOverTimeButtonPress() {
			var sDialogName = "Dialog4";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];

			if (!oDialog) {
				oDialog = new Dialog4(this.getView());
				this.mDialogs[sDialogName] = oDialog; // For navigation.

				oDialog.setRouter(this.oRouter);
			}

			oDialog.open();

		},

		showDialog: function(eName, oEvent) {

			var mDialogs = {};
			var sDialogName = eName;
			var oDialog = mDialogs[sDialogName];

			if (!oDialog) {

				switch (eName) {

					case "Dialog1":
						oDialog = new Dialog1(this.getView()); //Justificar ausencia
						break;
					case "Dialog4":
						oDialog = new Dialog4(this.getView()); //Horas Extras
						break;
					case "Dialog5":
						oDialog = new Dialog5(this.getView()); //Banco de Horas
						break;
				}

				//this.mDialogs[sDialogName] = oDialog;
				mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			oDialog.open();

		},

		_onButtonPress: function(oEvent) {
			var button = oEvent.getSource();
			var name = button.getId();
			name = name.replace("__xmlview0--", "");

			switch (name) {

				case "justification":
					this.showDialog("Dialog1", oEvent); //Justificacao
					break;
				case "overTime":
					this.showDialog("Dialog4", oEvent); //Horas Extras
					break;
				case "bankHour":
					this.showDialog("Dialog5", oEvent); //Banco de Horas
					break;

			}

		},

		_onButtonPress1: function(oEvent) {

			this.mPopovers = this.mPopovers || {};
			var sPopoverName = "Popover1";
			var oPopover1 = this.mPopovers[sPopoverName];

			if (!oPopover1) {
				oPopover1 = new Popover1(this.getView());
				this.mPopovers[sPopoverName] = oPopover1;

				oPopover1.getControl().setPlacement("Auto");

				// For navigation.
				oPopover1.setRouter(this.oRouter);
			}

			var oSource = oEvent.getSource();

			oPopover1.open(oSource);

		},

		_onExcluirMarksButtonPress: function(oEvent) {

			this.mPopovers = this.mPopovers || {};
			var sPopoverName = "ExcluirMarcacoes";
			var oPopover = this.mPopovers[sPopoverName];

			if (!oPopover) {
				oPopover = new ExcluirMarcacoes(this.getView());
				this.mPopovers[sPopoverName] = oPopover;
				oPopover.getControl().setPlacement("Auto"); // For navigation.

				oPopover.setRouter(this.oRouter);
			}

			var oSource = oEvent.getSource();
			oPopover.open(oSource);
		},

		_onCancelarTroca: function() {
			this._oControl.close();
		},
		_onDialogOpen: function(oEvent) {
			if (oEvent) {
				oEvent.open();
				$("#" + oEvent.getContent()[0].getItems()[1].getId()).find(".sapUiCalDatesRow").css("display", "none");
				$("#" + oEvent.getContent()[0].getItems()[1].getId()).find("#calendar--Head-prev").css("display", "none");
				$("#" + oEvent.getContent()[0].getItems()[1].getId()).find("#calendar--Head-next").css("display", "none");
			}

		},
		_onGravarTroca: function(oEvent) {
			var items = this.getSelectedPointTreatmentItems();
			var pernr;

			pernr = items[0].PERNR + ",";
			for (var i = 1; i < items.length; i++) {

				pernr = pernr + items[i].PERNR;

				if ((i + 1) < items.length) {
					pernr = pernr + ",";
				}
			}

			var obj = {
				ano: oEvent.getSource().getParent().getContent()[0].getItems()[1].getStartDate().getFullYear(),
				mes: oEvent.getSource().getParent().getContent()[0].getItems()[1].getStartDate().getMonth() + 1,
				NumeroPessoal: pernr
			};
			var stringParam = "/sap/opu/odata/sap/ZODHR_SS_TREATED_E_SRV/ListaImgSet(NumeroPessoal='" + obj.NumeroPessoal +
				"',Mes='" + obj.mes + "',Ano='" + obj.ano + "')/$value";
			//localStorage.setItem("espelhoDePonto", stringParam);
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: stringParam,
				success: function(data) {
					sap.ui.core.BusyIndicator.hide();
					if (data !== "") {
						//window.open(localStorage.getItem("espelhoDePonto"), "_blank");
					} else {
						var dialog = new sap.m.Dialog({
							title: "Erro",
							type: "Message",
							state: "Error",
							content: new sap.m.Text({
								text: "Não foi possível gerar o espelho de ponto."
							}),
							beginButton: new sap.m.Button({
								text: "OK",
								press: function() {
									dialog.close();
								}
							}),
							afterClose: function() {
								dialog.destroy();
							}
						});

						dialog.open();

					}

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageToast.show(jQuery.parseXML(error.responseText).getElementsByTagName("message")[0].innerHTML, {
						duration: 9000
					});
				}
			});
			this._oControl.close();

		},
		MarksEdited: function(sEvent, sChanel, oData) {
			var pointTreatmentItem = this.getSelectedPointTreatmentItems()[0];
			var obj = {
				NumeroPessoal: pointTreatmentItem.PERNR,
				Nome: pointTreatmentItem.NOME,
				HoraContratual: pointTreatmentItem.HR_TEOR,
				Werks: pointTreatmentItem.WERKS,
				WerksDesc: pointTreatmentItem.WERKS_DESC,
				Orgeh: pointTreatmentItem.ORGEH,
				OrgehDesc: pointTreatmentItem.ORGEH_DESC,
				Kostl: pointTreatmentItem.KOSTL,
				KostlDesc: pointTreatmentItem.KOSTL_DESC,
				Persg: pointTreatmentItem.PERSG,
				PersgDesc: pointTreatmentItem.PERSG_DESC,
				Schkz: pointTreatmentItem.SCHKZ,
				TipoDeEquipe: pointTreatmentItem.TIPO_EQUIPE,
				Schkz_Desc: "",
				CabecalhoToMarcacaoNav: oData
			};
			var param = "/CabecalhoTratamentoPontoSet";
			sap.ui.core.BusyIndicator.show();
			this.sendCreateModel(obj, param);
		},
		ReasonSelected: function(sChanel, sEvent, oData) {
			var pointTreatmentItems = this.getSelectedPointTreatmentItems();

			var obj = {
				NumeroPessoal: "",
				ABWGR: oData.motivo,
				GTEXT: oData.motivoTexto,
				HorarioPadraoToTratamentoNav: pointTreatmentItems
			};
			var param = "/HorarioPadraoSet";
			sap.ui.core.BusyIndicator.show();
			this.sendCreateModel(obj, param);
		},
		JustificationSelected: function(sChanel, sEvent, oData) {
			var pointTreatmentItems = this.getSelectedPointTreatmentItems();

			var obj = {
				NumeroPessoal: "",
				AWART: oData.justification,
				ATEXT: oData.justificationText,
				BEGDA: oData.dataInicio,
				ENDDA: oData.dataFim,
				BEGHOUR: oData.horaInicio,
				ENDHOUR: oData.horaFim,
				HORAS: oData.horas,
				JusticarToCabecalhoNav: pointTreatmentItems
			};
			var param = "/JustificarSet";
			sap.ui.core.BusyIndicator.show();
			this.sendCreateModel(obj, param);
		},

		BancoHoras: function(sChanel, sEvent, oData) {
			var oHeader = this.getView().getModel("headerData").getData();
			var obj = {
				Pernr: oHeader.NumeroPessoal,
				Data: oData.data,
				TpTempo: oData.tpTempo,
				QtHoras: oData.qtHoras
					//JusticarToCabecalhoNav: pointTreatmentItems
			};
			var param = "/BancoHorasSet('" + oHeader.NumeroPessoal + "')";
			sap.ui.core.BusyIndicator.show();
			this.sendUpdateModel(obj, param);

		},

		HorasExtras: function(sChanel, sEvent, oData) {
			var oHeader = this.getView().getModel("headerData").getData();
			var obj = {
				PERNR: oHeader.NumeroPessoal,
				DATA: oData.Data,
				VTKEN_FROM: oData.Vtken_From,
				VTKEN_TO: oData.Vtken_To,
				DIA_ANT: oData.Dia_ant,
				TP_REMUR: oData.tpRemur,
				TP_PRESENCA: oData.Tp_Presenca
			};

			var param = "/HorasExtrasSet(PERNR='" + oHeader.NumeroPessoal + "',DATA='" + oData.Data + "')";
			sap.ui.core.BusyIndicator.show();
			this.sendCreateModel(obj, param);

		},

		editForJustification: function(items) {
			var editedItems = [];
			for (var i = 0; i < items.length; i++) {
				var editedItem = {
					NumeroPessoal: items[0].PERNR,
					Nome: items[0].NOME,
					HoraContratual: items[0].HR_TEOR,
					Werks: items[0].WERKS,
					WerksDesc: items[0].WERKS_DESC,
					Orgeh: items[0].ORGEH,
					OrgehDesc: items[0].ORGEH_DESC,
					Kostl: items[0].KOSTL,
					KostlDesc: items[0].KOSTL_DESC,
					Persg: items[0].PERSG,
					PersgDesc: items[0].PERSG_DESC,
					Schkz: "",
					TipoDeEquipe: items[0].TIPO_EQUIPE,
					Schkz_Desc: ""
				};
				editedItems.push(editedItem);
			}
			return editedItems;
		},

		onBeforeRendering: function() {
			var that = this;
			that.getView().byId("dtFiltro").addStyleClass("disbalekb");

		},

		onDateChange: function(oEvent) {

			var fieldname = oEvent.getParameter("id").substring(12);

			if (oEvent.getParameter("valid") === true) {
				this.fMessage("None", null, fieldname);
			} else {
				this.fMessage("Error", "entrada_invalida", fieldname);
				var msgErr = "Favor inserir data corretamente, Ex: mm.aaaa/mmaaaa";
				MessageToast.show(msgErr);
			}

		},

		fMessage: function(type, msg, field) {
			var oBundle;

			//Get message text from i18n
			oBundle = this.getView().getModel("i18n").getResourceBundle();

			var message = oBundle.getText(msg);

			//Message text
			this.getView().byId(field).setValueStateText(message);

			//Set message in the field with the type and text
			this.getView().byId(field).setValueState(sap.ui.core.ValueState[type]);
		},

		onFiltrar: function() {

			if (this.getView().byId("dtFiltro").getValue() !== "") {

				var dtEscolhida = this.getView().byId("dtFiltro").getValue();
				var mes = dtEscolhida.substring(0, 2);
				var ano = dtEscolhida.substring(3, 7);

				var stringParam = "/TratamentoDoPontoSet";
				var aFilters = [];

				var oFilter = new sap.ui.model.Filter({
					path: "MES",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: mes
				});
				aFilters.push(oFilter);

				var oFilterAno = new sap.ui.model.Filter({
					path: "ANO",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: ano
				});
				aFilters.push(oFilterAno);

				var me = this;
				this.getView().setBusy(true);
				connections.consumeModel(
					stringParam,
					function(oData, oResponse) {
						me.getView().setBusy(false);
						for (var i = 0; i < oData.results.length; i++) {
							oData.results[i].visible = true;
							oData.results[i].DATADISPLAY = oData.results[i].DT_OCOR.substring(6, 8) + "/" + oData.results[i].DT_OCOR.substring(4, 6) + "/" +
								oData.results[i].DT_OCOR.substring(0, 4);
						}
						me.setPointTreatmentData(oData.results);
						me.setFilterData(oData.results);
						if (me.oSearchEvent) {
							me.onSearch(me.oSearchEvent);
						}

						var txtPeriodo = oData.results[0].DESC_PERIODO;
						me.getView().byId("txtPeriodo").setText(txtPeriodo);

					},
					function(err) {
						me.getView().setBusy(false);
						var dialog = new sap.m.Dialog({
							title: "Erro",
							type: "Message",
							state: "Error",
							content: new sap.m.Text({
								text: "Não foi possível carregar os dados"
							}),
							beginButton: new sap.m.Button({
								text: "OK",
								press: function() {
									dialog.close();
								}
							}),
							afterClose: function() {
								dialog.destroy();
							}
						});

						dialog.open();
					}, "", aFilters
				);

			} else {
				var msg = "Necessário informar o periodo da busca!";
				MessageToast.show(msg);
			}
		},

		handleSearch: function(liveq) {

			//Filtrar por 1 unico campo
			var livequery = liveq.getParameters().newValue;
			var filter1 = new sap.ui.model.Filter("DESCR_OCOR", FilterOperator.Contains, livequery);
			var tabledata = this.byId("PointTreatmentTable");
			var binding = tabledata.getBinding("items");
			binding.filter(filter1);
		},

		enableButtons: function(oData) {
			var oModelH = this.getView().getModel("headerData").getData();
			var oModelL = oData[0];

			//Elektro
			if (oModelH.Bukrs === "EKT" ||
				oModelH.Bukrs === "EKTT" ||
				oModelH.Bukrs === "EKO" ||
				oModelH.Bukrs === "AFLT") {

				if (oModelH.Persk === "FO") {
					this.byId("bankHour").setEnabled(true);

				} else if (oModelH.Persk === "FP") {
					this.byId("bankHour").setEnabled(true);
					if (oModelH.Stell === "80402316" ||
						oModelH.Stell === "80401845" ||
						oModelH.Stell === "80402095" ||
						oModelH.Stell === "00002218" ||
						oModelH.Stell === "00002219" ||
						oModelH.Stell === "00002220" ||
						oModelH.Stell === "00002475" ||
						oModelH.Stell === "00003119" ||
						oModelH.Stell === "80401846" ||
						oModelH.Stell === "80401847" ||
						oModelH.Stell === "80402316") {
						this.byId("bankHour").setEnabled(false);

					}
				} else if (oModelH.Persk === "FQ") {
					this.byId("bankHour").setEnabled(false);
					if (oModelH.Stell === "80401776" ||
						oModelH.Stell === "80401777" ||
						oModelH.Stell === "80402125" ||
						oModelH.Stell === "80402225" ||
						oModelH.Stell === "00002149" ||
						oModelH.Stell === "00002150" ||
						oModelH.Stell === "00002505" ||
						oModelH.Stell === "00002506") {
						this.byId("bankHour").setEnabled(true);

					}
				}

				// Neoenergia
			} else {
				//	Habilitar ou não botão de Banco de Horas de acordo com infotipo 2012
				if (oModelH.ZTART === "8EK3" &&
					oModelH.Anzhl !== "0.00") { //NeoEnergia
					this.byId("bankHour").setEnabled(true);
				} else {
					this.byId("bankHour").setEnabled(false);
				}
			}

			//			Habilitar ou não botão de Horas Extras de acordo com infotipo 0007
			if (oModelH.Zterf === "9") {
				this.byId("overTime").setEnabled(true);
			} else {
				this.byId("overTime").setEnabled(false);
			}

			if (oModelH.Bukrs === "EKT" ||
				oModelH.Bukrs === "ELKT" ||
				oModelH.Bukrs === "EKO" ||
				oModelH.Bukrs === "COM" ||
				oModelH.Bukrs === "9947") {
				this.byId("overTime").setEnabled(false);
			}
		},

		onInit: function() {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			sap.ui.getCore().getConfiguration().setLanguage("pt-BR");
			sap.ui.getCore().setModel(this, "TratamentoPontoColaborador");
			this.getHeaderData();
			this.getPointTreatmentData();
			this.getBancoDeHorasData();
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("ReasonDialogColaborador", "Reason", this.ReasonSelected, this);
			oEventBus.subscribe("JustificationDialogColaborador", "Justification", this.JustificationSelected, this);
			oEventBus.subscribe("TelaEditarMarcacoesColaborador", "MarksEdited", this.MarksEdited, this);
			oEventBus.subscribe("ExcluirMarcacoesColaborador", "MarksExcluir", this.MarksExcluir, this);
			oEventBus.subscribe("TelaBancoHoras", "BancoHoras", this.BancoHoras, this);
			oEventBus.subscribe("TelaHorasExtras", "HorasExtras", this.HorasExtras, this);

			this.onBeforeRendering();
		},
		onExit: function() {
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.unsubscribe("ReasonDialogColaborador", "Reason", this.ReasonSelected, this);
			oEventBus.unsubscribe("JustificationDialogColaborador", "Justification", this.JustificationSelected, this);
			oEventBus.unsubscribe("TelaEditarMarcacoesColaborador", "MarksEdited", this.MarksEdited, this);
			oEventBus.unsubscribe("ExcluirMarcacoesColaborador", "MarksExcluir", this.MarksExcluir, this);
			oEventBus.unsubscribe("TelaBancoHoras", "BancoHoras", this.BancoHoras, this);
			oEventBus.unsubscribe("TelaHorasExtras", "HorasExtras", this.HorasExtras, this);
		}
	});
});