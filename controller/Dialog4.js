sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"com/neo/ZODHR_SS_TIME_C/webServices/connections",
	"sap/ui/model/json/JSONModel"
], function (ManagedObject, MessageBox, Utilities, History, connections, JSONModel) {

	return ManagedObject.extend("com.neo.ZODHR_SS_TIME_C.controller.Dialog4", {

		getTipoRemurData: function () {
			var stringParam = "/TipoRemuneracaoSet";
			var aFilters = [];
			var me = this;

			connections.consumeModel(
				stringParam,
				function (oData, oResponse) {
					me.setRemurData(oData.results);
				},
				function (err) {
					sap.m.MessageToast.show("Não foi possível carregar os dados", {
						duration: 3000
					});
				}, "", aFilters
			);
		},

		setRemurData: function (oData) {

			var displayData = [];
			for (var i = 0; i < oData.length; i++) {
				displayData.push(oData[i]);
			}

			var json = new sap.ui.model.json.JSONModel();
			json.setData(displayData);
			this.getView().setModel(json, "tpRemurData");
		},

		constructor: function (oView) {

			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_C.view.Dialog4", this);
			this._bInit = false;

			this.setValues();
		},

		closeDialog: function () {
			this.close();

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

		open: function () {
			this.getTipoRemurData();

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

		close: function () {
			this._oControl.close();
			this.onExit();
		},

		setRouter: function (oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function () {
			return {};

		},

		getTpPres: function () {
			var oPres = new JSONModel();
			var oModelH = this.getView().getModel("headerData").getData();

			//			Elektro
			if (oModelH.Bukrs === "EKT" ||
				oModelH.Bukrs === "EKTT" ||
				oModelH.Bukrs === "EKO" ||
				oModelH.Bukrs === "CELP" ||
				oModelH.Bukrs === "AFLT") {
				oPres.setData({
					table: [{
						Key: "0400",
						Value: "Viagem a serviço"
					}, {
						Key: "0410",
						Value: "Treinamento"
					}, {
						Key: "0420",
						Value: "Seminário/Curso"
					}, {
						Key: "0700",
						Value: "Reunião externa"
					}, {
						Key: "0800",
						Value: "Horas Normais"
					}, {
						Key: "0801",
						Value: "Horas Extras"
					}]
				});

			} else {
				oPres.setData({
					table: [{
						Key: "0900",
						Value: "Horas Extras"
					}, {
						Key: "0901",
						Value: "Horas Extras per flexível"
					}]
				});
			}

			this.getView().setModel(oPres, "tpPres");
		},

		_onSelectTpPres: function _onSelectJustification(oEvent) {
			this.tpPresTexto = oEvent.getSource().getValue();
			this.tpPres = oEvent.getSource().getSelectedKey();
		},

		_onSelectTpRemur: function _onSelectJustification(oEvent) {
			this.tpRemurTexto = oEvent.getSource().getValue();
			this.tpRemur = oEvent.getSource().getSelectedKey();
		},

		_onButtonPress: function (oEvent) {
			var data = this.getView().byId("idData").getValue();
			var hrsAte = this.getView().byId("idHrsAte").getValue();
			var hrsDe = this.getView().byId("idHrsDe").getValue();

			if (this.getView().byId("idDiaAnt").getSelected()) {
				var diaAnt = 'X';
			}

			var formFilled = this.verifyFields(data, hrsAte, hrsDe);

			//data = data.replaceAll("-", "");

			if (formFilled) {
				var oData = {
					Data: data,
					Vtken_From: hrsDe,
					Vtken_To: hrsAte,
					Dia_ant: diaAnt,
					Tp_Presenca: this.tpPres,
					tpRemurTexto: this.tpRemurTexto,
					tpRemur: this.tpRemur
				};
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.publish("TelaHorasExtras", "HorasExtras", oData);
				this.close();

			} else {
				sap.m.MessageToast.show("Preencher campos obrigátorios", {
					duration: 3000
				});
			}
		},

		verifyFields: function (eData, eHrsAte, eHrsDe) {

			if (this.tpPresTexto && eData && eHrsAte && eHrsDe) {
				return true;
			}

			return false;
		},

		onInit: function () {

			this._oDialog = this.getControl();

		},

		onExit: function () {
			this._oDialog.destroy();

		},

		setValues: function () {

			var lData = this.getView().getModel("headerData").getData();
			var idPernr = this.getView().byId("idPernr");

			idPernr.setValue(lData.NumeroPessoal);
			this.getTpPres();

		}

	});
}, /* bExport= */ true);