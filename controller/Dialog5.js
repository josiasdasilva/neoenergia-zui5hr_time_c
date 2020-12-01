sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"com/neo/ZODHR_SS_TIME_C/webServices/connections",
	"sap/ui/model/json/JSONModel"
], function(ManagedObject, MessageBox, Utilities, History, connections, JSONModel) {
//teste
	return ManagedObject.extend("com.neo.ZODHR_SS_TIME_C.controller.Dialog5", {

		getJustificationData: function() {
			var stringParam = "/HorarioPadraoSet";
			var aFilters = [];
			var me = this;
			connections.consumeModel(
				stringParam,
				function(oData, oResponse) {
					me.setJustificationData(oData.results);
				},
				function(err) {
					sap.m.MessageToast.show("Não foi possível carregar os dados", {
						duration: 3000
					});
				}, "", aFilters
			);
		},

		constructor: function(oView) {

			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_C.view.Dialog5", this);
			this._bInit = false;

			this.setValues();
		},

		closeDialog: function() {

			this.close();

		},
		exit: function() {
			delete this._oView;
		},

		getView: function() {
			return this._oView;
		},

		getControl: function() {
			return this._oControl;
		},

		getOwnerComponent: function() {
			return this._oView.getController().getOwnerComponent();
		},

		_onSelectTpPres: function(oEvent) {
			this.tpPresTexto = oEvent.getSource().getValue();
			this.tpPres = oEvent.getSource().getSelectedKey();
		},

		open: function() {
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

			this.setPeriodo();

		},

		setPeriodo: function setPeriodo() {

			var data = new Date(),
				mes = (data.getMonth() + 2).toString(), //+1 pois no getMonth Janeiro começa com zero.
				mesF = (mes.length == 1) ? "0" + mes : mes,
				anoF = data.getFullYear();

			if (mesF === "13") {
				mesF = "01";
				anoF++;
			}
			var periodo = "01" + "." + mesF + "." + anoF;
			this.getView().byId("idData").setValue(periodo);

		},

		close: function() {
			this._oControl.close();
			this.onExit();
		},

		setRouter: function(oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function() {
			return {};

		},

		_onButtonPress: function(oEvent) {
			var data = this.getView().byId("idData").getValue();
			var horas = this.getView().byId("idHoras").getValue();

			if (this.verifyFields(horas)) {
				var oData = {
					data: data,
					tpTempo: this.tpTempo,
					qtHoras: horas
				};
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.publish("TelaBancoHoras", "BancoHoras", oData);
				//this.closeDialog();
				this.close();

			} else {
				sap.m.MessageToast.show("Limite acima do permitido", {
					duration: 3000
				});
			}
		},

		verifyFields: function(eHoras) {

			if (eHoras > 33) {
				return false;
			}

			return true;

		},

		onInit: function() {

			this._oDialog = this.getControl();

		},

		//------------- Status --------------
		getTpTempoEkt: function() {
			var oTempo = new JSONModel();
			oTempo.setData({
				table: [{
					Key: "0013",
					Value: "Hora Extra para BHO"
				}]
			});
			this.getView().setModel(oTempo, "tpTempo");
		},

		getTpTempoNeo: function() {
			var oTempo = new JSONModel();
			oTempo.setData({
				table: [{
					Key: "8713",
					Value: "EKKT- HE Pagto (BHO)"
				}]
			});
			this.getView().setModel(oTempo, "tpTempo");
		},

		_onSelectTpTempo: function(oEvent) {
			this.tpTempoTexto = oEvent.getSource().getValue();
			this.tpTempo = oEvent.getSource().getSelectedKey();
		},

		onExit: function() {

			this._oDialog.destroy();

		},

		setValues: function() {

			var lData = this.getView().getModel("headerData").getData();
			var idPernr = this.getView().byId("idPernr");
			var Bukrs = this.getView().getModel("headerData").getData().Bukrs;

			idPernr.setValue(lData.NumeroPessoal);

			if (Bukrs === "EKT" ||
				Bukrs === "9947" ||
				Bukrs === "EKO" ||
				Bukrs === "ELKT" ||
				Bukrs === "ET01" ||
				Bukrs === "ET02" ||
				Bukrs === "ET03" ||
				Bukrs === "ET05" ||
				Bukrs === "ET11" ||
				Bukrs === "ET12" ||
				Bukrs === "COM" ||
				Bukrs === "EKB") { //Elektro
				this.getTpTempoEkt();

			} else {
				this.getTpTempoNeo();
			}
		}

	});
}, /* bExport= */ true);