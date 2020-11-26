sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"com/neo/ZODHR_SS_TIME_C/webServices/connections"
], function (ManagedObject, MessageBox, Utilities, History, connections) {

	return ManagedObject.extend("com.neo.ZODHR_SS_TIME_C.controller.Dialog2", {
		getJustificationData: function () {
			var stringParam = "/HorarioPadraoSet";
			var aFilters = [];
			var me = this;
			connections.consumeModel(
				stringParam,
				function (oData, oResponse) {
					me.setJustificationData(oData.results);
				},
				function (err) {
					sap.m.MessageToast.show("Não foi possível carregar os dados", {
						duration: 3000
					});
				}, "", aFilters
			);
		},
		setJustificationData: function (oData) {
			var json = new sap.ui.model.json.JSONModel();
			json.setData(oData);
			this.getView().setModel(json, "justificationData");
		},
		constructor: function (oView) {
			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_C.view.Dialog2", this);
			this._bInit = false;
		},
		_onButtonPress1: function () {

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
			this.getJustificationData();
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
			var dependents = this._oView.getDependents();
			for (var i = 0; i < dependents.length; i++) {
				if (dependents[i].getProperty("title") === "Motivo Nova Marcação") {
					dependents[i].getContent()[0].setValue("");
					dependents[i].getContent()[0].setSelectedKey("");
					this.motivo = "";
					this.motivoTexto = "";
				}
			}
			this._oControl.close();
		},

		setRouter: function (oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function () {
			return {};

		},
		verifyFields: function () {
			if (this.motivoTexto) {
				return true;
			} else {
				return false;
			}
		},
		_onSelectJustification: function (oEvent) {
			this.motivoTexto = oEvent.getSource().getValue();
			this.motivo = oEvent.getSource().getSelectedKey();
		},
		_onButtonPress: function (oEvent) {
			var formFilled = this.verifyFields();
			if (formFilled) {
				var oData = {
					motivoTexto: this.motivoTexto,
					motivo: this.motivo
				};
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.publish("ReasonDialogColaborador", "Reason", oData);
				this.close();
			} else {
				sap.m.MessageToast.show("Selecione o motivo", {
					duration: 3000
				});
			}
		},
		onInit: function () {

			this._oDialog = this.getControl();

		},
		onExit: function () {
			this._oDialog.destroy();

		}

	});
}, /* bExport= */ true);