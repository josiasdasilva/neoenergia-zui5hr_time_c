sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"com/neo/ZODHR_SS_TIME_C/webServices/connections"
], function (ManagedObject, MessageBox, Utilities, History, connections) {

	return ManagedObject.extend("com.neo.ZODHR_SS_TIME_C.controller.Popover1", {
		constructor: function (oView) {
			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_C.view.Popover1", this);
			this._bInit = false;
		},

		exit: function () {
			delete this._oView;
		},

		getView: function () {
			return this._oView;
		},

		getControl: function () {
			return this._oControl;
		},

		getOwnerComponent: function () {
			return this._oView.getController().getOwnerComponent();
		},
		getMarksData: function () {
			var item = sap.ui.getCore().getModel("TratamentoPontoColaborador").getSelectedPointTreatmentItems()[0];
			var stringParam = "/InserirMarcacaoSet";
			var aFilters = [];
			var oFilter = new sap.ui.model.Filter({
				path: "DATUM",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: item.DT_OCOR
			});
			aFilters.push(oFilter);
			oFilter = new sap.ui.model.Filter({
				path: "PERNR",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: item.PERNR
			});
			aFilters.push(oFilter);
			var me = this;
			this.data = item.DT_OCOR;
			connections.consumeModel(
				stringParam,
				function (oData, oResponse) {

					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].INDEX = i;
						oData.results[i].VISIBLE = (oData.results[i].DATUM === this.data);
						oData.results[i].newStructure = [];
						oData.results[i].DATA_DISPLAY = oData.results[i].DATUM.substring(6, 8) + "/" + oData.results[i].DATUM.substring(4, 6) + "/" +
							oData.results[i].DATUM.substring(0, 4);
						// Estrutura para montar os dados de marca��o
						for (var indx = 0; indx < 4; indx++) {
							var sHora = oData.results[i]["LTIME_0" + (indx + 1)] || "";
							if (sHora !== "") {
								sHora = sHora.substring(0, 5);
							}
							oData.results[i].newStructure.push({
								hora: sHora,
								diaAnt: oData.results[i]["VTKNEN_0" + (indx + 1)] === "X" ? true : false,
								motivo: oData.results[i]["ABWGR_0" + (indx + 1)]
							});
						}

					}
					for (var idx = i; idx < 3; idx++) {
						oData.results.push({
							DATA_DISPLAY: "",
							VISIBLE: false
						});
					}
					var json = new sap.ui.model.json.JSONModel();
					json.setData(oData);
					this.getView().setModel(json, "marksData");
					this.setSelectedSegButton();
				}.bind(this),
				function (err) {
					sap.m.MessageToast.show("Não foi possível carregar os dados", {
						duration: 3000
					});
				}, "", aFilters
			);
		},
		setSelectedSegButton: function () {
			var buttons = this.getView().byId("segButton").getButtons();
			var btTxt;
			for (var i = 0; i < buttons.length; i++) {
				btTxt = buttons[i].getText().substring(6) + buttons[i].getText().substring(3, 5) + buttons[i].getText().substring(0, 2);
				if (btTxt === this.data) {
					this.getView().byId("segButton").setSelectedKey(i);
				}
			}
		},
		_onSegButtonPress: function (oEvent) {
			var oModel = this.getView().getModel("marksData");
			for (var indx = 0; indx < 3; indx++) {
				if (oModel.getObject("/results/" + indx)) {
					oModel.setProperty("/results/" + indx + "/VISIBLE", false);
				}
			}
			oModel.setProperty("/results/" + this._oView.byId("segButton").getSelectedKey() + "/VISIBLE", true);
		},

		getMarkEditReasonData: function () {
			var stringParam = "/HorarioPadraoSet";
			var aFilters = [];
			var me = this;
			connections.consumeModel(
				stringParam,
				function (oData, oResponse) {
					me.setMarkEditReasonData(oData.results);
				},
				function (err) {
					sap.m.MessageToast.show("Não foi possível carregar os dados", {
						duration: 3000
					});
				}, "", aFilters
			);
		},
		setMarkEditReasonData: function (oData) {
			var json = new sap.ui.model.json.JSONModel();
			json.setData(oData);
			this.getView().setModel(json, "markEditReasonData");
		},
		setMarksData: function (oData) {
			var json = new sap.ui.model.json.JSONModel();
			json.setData(oData);
			this.getView().setModel(json, "marksData");
		},

		open: function () {
			this._oView.byId("segButton").setSelectedKey("1");
			this.getMarksData();
			this.getMarkEditReasonData();
			var oView = this._oView;
			var oControl = this._oControl;

			if (!this._bInit) {

				// Initialize our fragment
				this.onInit();

				this._bInit = true;

				// connect fragment to the root view of this component (models, lifecycle)
				oView.addDependent(oControl);
			}

			var args = Array.prototype.slice.call(arguments);
			if (oControl.open) {
				oControl.open.apply(oControl, args);
			} else if (oControl.openBy) {
				oControl.openBy.apply(oControl, args);
			}
		},

		setRouter: function (oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function () {
			return {};

		},
		_onButtonPress: function (oEvent) {

			if (this.fValidaHora() === false) {
				this.GetEditMarksInfo();
				this._onButtonPress1();

			}

		},
		_onButtonPress1: function () {
			this._oView.getModel("marksData").setData({});
			this._oControl.close();
			this.oPopover1 = undefined;
			//this.onExit();

		},

		fValidaHora: function () {

			var erro;
			for (var indx = 0; indx < 3; indx++) {
				var itm = this._oView.byId("marksList" + indx);
				var hora1 = itm.getRows()[0].getCells()[0].getValue();
				var hora2 = itm.getRows()[1].getCells()[0].getValue();
				var hora3 = itm.getRows()[2].getCells()[0].getValue();
				var hora4 = itm.getRows()[3].getCells()[0].getValue();

				var hh = hora1.substring(0, 2);
				var mm = hora1.substring(3, 5);

				if (hh < "24" && mm < "60") {
					if (hh !== "" && mm !== "") {
						var dt = new Date();
						dt.setHours(hh, mm, "00");
						if (isNaN(dt.getTime())) {
							MessageBox.error("Marcação inválida, favor informar um horario válido, por exemplo: '00:00'");
							erro = true;
							return erro;
						}
					} else {
						MessageBox.error("Marcação inválida, favor informar um horario válido, por exemplo: '00:00'");
						erro = true;
						return erro;
					}
				} else {
					MessageBox.error("Marcação inválida, favor informar um horario válido, por exemplo: '00:00'");
					erro = true;
					return erro;
				}

				var hh2 = hora2.substring(0, 2);
				var mm2 = hora2.substring(3, 5);

				if (hh2 < "24" && mm2 < "60") {

					if (hh2 !== "" && mm2 !== "") {
						var dt2 = new Date();
						dt2.setHours(hh2, mm2, "00");
						if (isNaN(dt2.getTime())) {
							MessageBox.error("Marcação inválida, favor informar um horario válido, por exemplo: '00:00'");
							erro = true;
							return erro;
						}
					} else {
						MessageBox.error("Marcação inválida, favor informar um horario válido, por exemplo: '00:00'");
						erro = true;
						return erro;
					}
				} else {
					MessageBox.error("Marcação inválida, favor informar um horario válido, por exemplo: '00:00'");
					erro = true;
					return erro;
				}

				var hh3 = hora3.substring(0, 2);
				var mm3 = hora3.substring(3, 5);

				if (hh3 < "24" && mm3 < "60") {

					if (hh3 !== "" && mm3 !== "") {

						var dt3 = new Date();
						dt3.setHours(hh3, mm3, "00");
						if (isNaN(dt3.getTime())) {
							MessageBox.error("Marcação inválida, favor informar um horario válido, por exemplo: '00:00'");
							erro = true;
							return erro;
						}
					} else {
						MessageBox.error("Marcação inválida, favor informar um horario válido, por exemplo: '00:00'");
						erro = true;
						return erro;
					}
				} else {
					MessageBox.error("Marcação inválida, favor informar um horario válido, por exemplo: '00:00'");
					erro = true;
					return erro;
				}

				var hh4 = hora4.substring(0, 2);
				var mm4 = hora4.substring(3, 5);

				if (hh4 < "24" && mm4 < "60") {
					if (hh4 !== "" && mm4 !== "") {
						var dt4 = new Date();
						dt4.setHours(hh4, mm4, "00");
						if (isNaN(dt4.getTime())) {
							MessageBox.error("Marcação inválida, favor informar um horario válido, por exemplo: '00:00'");
							erro = true;
							return erro;
						}
					} else {
						MessageBox.error("Marcação inválida, favor informar um horario válido, por exemplo: '00:00'");
						erro = true;
						return erro;
					}
				} else {
					MessageBox.error("Marcação inválida, favor informar um horario válido, por exemplo: '00:00'");
					erro = true;
					return erro;
				}

			}
			erro = false;
			return erro;

		},

		GetEditMarksInfo: function () {
			var item = sap.ui.getCore().getModel("TratamentoPontoColaborador").getSelectedPointTreatmentItems()[0];
			var oModel = this._oView.getModel("marksData");
			var aTratamento = [];
			for (var indx = 0; indx < 3; indx++) {
				var itm = this._oView.byId("marksList" + indx);
				var sPath = "/results/" + indx;
				if (oModel.getObject(sPath + "/DATA_DISPLAY") !== "") {
					oModel.setProperty(sPath + "/newStructure/0/motivo", itm.getRows()[0].getCells()[2].getSelectedKey());
					oModel.setProperty(sPath + "/newStructure/1/motivo", itm.getRows()[1].getCells()[2].getSelectedKey());
					oModel.setProperty(sPath + "/newStructure/2/motivo", itm.getRows()[2].getCells()[2].getSelectedKey());
					oModel.setProperty(sPath + "/newStructure/3/motivo", itm.getRows()[3].getCells()[2].getSelectedKey());
					var dataDatum = oModel.getObject(sPath + "/DATA_DISPLAY");
					dataDatum = dataDatum.substr(6) + dataDatum.substr(3, 2) + dataDatum.substr(0, 2);
					var oTratamento = {
						PERNR: item.PERNR,
						DATUM: dataDatum,
						LTIME_01: oModel.getObject(sPath + "/newStructure/0/hora").split(":").join("") + "00",
						VTKNEN_01: oModel.getObject(sPath + "/newStructure/0/diaAnt") === true ? "X" : "",
						ABWGR_01: oModel.getObject(sPath + "/newStructure/0/motivo"),
						LTIME_02: oModel.getObject(sPath + "/newStructure/1/hora").split(":").join("") + "00",
						VTKNEN_02: oModel.getObject(sPath + "/newStructure/1/diaAnt") === true ? "X" : "",
						ABWGR_02: oModel.getObject(sPath + "/newStructure/1/motivo"),
						LTIME_03: oModel.getObject(sPath + "/newStructure/2/hora").split(":").join("") + "00",
						VTKNEN_03: oModel.getObject(sPath + "/newStructure/2/diaAnt") === true ? "X" : "",
						ABWGR_03: oModel.getObject(sPath + "/newStructure/2/motivo"),
						LTIME_04: oModel.getObject(sPath + "/newStructure/3/hora").split(":").join("") + "00",
						VTKNEN_04: oModel.getObject(sPath + "/newStructure/3/diaAnt") === true ? "X" : "",
						ABWGR_04: oModel.getObject(sPath + "/newStructure/3/motivo"),
						LTIME_05: oModel.getProperty(sPath).LTIME_05,
						VTKNEN_05: oModel.getProperty(sPath).VTKNEN_05,
						ABWGR_05: oModel.getProperty(sPath).ABWGR_05,
						LTIME_06: oModel.getProperty(sPath).LTIME_06,
						VTKNEN_06: oModel.getProperty(sPath).VTKNEN_06,
						ABWGR_06: oModel.getProperty(sPath).ABWGR_06,
						PDSNR_01: oModel.getProperty(sPath).PDSNR_01,
						PDSNR_02: oModel.getProperty(sPath).PDSNR_02,
						PDSNR_03: oModel.getProperty(sPath).PDSNR_03,
						PDSNR_04: oModel.getProperty(sPath).PDSNR_04,
						TERID_01: oModel.getProperty(sPath).TERID_01,
						TERID_02: oModel.getProperty(sPath).TERID_02,
						TERID_03: oModel.getProperty(sPath).TERID_03,
						TERID_04: oModel.getProperty(sPath).TERID_04

					};
					aTratamento.push(oTratamento);
				}
			}
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("TelaEditarMarcacoesColaborador", "MarksEdited", aTratamento);
		},
		MarksSaved: function (sEvent, sChanel, oData) {
			this._oView.getModel("marksData").setData({});
			this.close();
		},
		onInit: function () {
			this._oDialog = this.getControl();
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("TelaEditarMarcacoesColaborador", "MarksSaved", this.MarksSaved, this);

		},
		onExit: function () {
			this._oDialog.destroy();

		}

	});
}, /* bExport= */ true);