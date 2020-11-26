sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/UploadCollectionParameter",
	"sap/ui/core/routing/History",
	"com/neo/ZODHR_SS_TIME_C/webServices/connections"
], function (ManagedObject, JSONModel, MessageToast, MessageBox, Utilities, Filter, FilterOperator,
	UploadCollectionParameter, History, connections) {

	return ManagedObject.extend("com.neo.ZODHR_SS_TIME_C.controller.Dialog1", {

		onInit: function () {
			this._oDialog = this.getControl();
			this.oModel = this.getOwnerComponent().getModel();
			this.initAttachment();

		},

		getJustificationData: function () {
			var stringParam = "/JustificarSet";
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

		onExit: function () {
			this._oDialog.destroy();

		},

		setJustificationData: function (oData) {
			var displayData = [];
			var item = sap.ui.getCore().getModel("TratamentoPontoColaborador").getSelectedPointTreatmentItems()[0];

			//Ler campo "Data" da lista da tela inicial e setar nos campos "begda" e "endda" da tela Justificativa
			var dt_ocor = sap.ui.getCore().getModel("TratamentoPontoColaborador").getSelectedPointTreatmentItems()[0].DT_OCOR.substring(6, 8) +
				"/" +
				sap.ui.getCore().getModel("TratamentoPontoColaborador").getSelectedPointTreatmentItems()[0].DT_OCOR.substring(4, 6) + "/" +
				sap.ui.getCore().getModel("TratamentoPontoColaborador").getSelectedPointTreatmentItems()[0].DT_OCOR.substring(0, 4);
			this.getView().byId("begda").setValue(dt_ocor);
			this.getView().byId("endda").setValue(dt_ocor);

			if (item.TP_ZTART) {
				for (var i = 0; i < oData.length; i++) {
					if (oData[i].TP_AWART === item.TP_ZTART) {
						displayData.push(oData[i]);
					}
				}
			} else {
				displayData = oData;
			}
			var json = new sap.ui.model.json.JSONModel();
			json.setData(displayData);
			this.getView().setModel(json, "justificationData");
		},

		constructor: function (oView) {
			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_C.view.Dialog1", this);
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
			this._oControl.close();
			this.onExit();

		},

		setRouter: function (oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function () {
			return {};

		},
		verifyFields: function (beghour, endhour) {
			if ((beghour !== "" && endhour === "") || (beghour === "" && endhour !== "")) {
				return false;
			} else {
				return true;
			}
		},
		_onSelectJustification: function (oEvent) {
			this.selectedJustification = oEvent.getSource().getSelectedKey();
			this.selectedJustificationText = oEvent.getSource().getValue();
		},
		_onButtonPress: function () {
			var begda = this.getView().byId("begda").getValue();
			var endda = this.getView().byId("endda").getValue();
			var beghour = this.getView().byId("beghour").getValue();
			var endhour = this.getView().byId("endhour").getValue();
			var horas = this.getView().byId("horas").getValue();

			var jtype = this.selectedJustification;
			var aItems = this.getView().byId("UploadCollection").getItems().length;
			var justif = this.checkAttachedJustificativa(aItems, jtype);
			if (justif) {

				var formFilled = this.verifyFields(beghour, endhour);
				if (formFilled) {
					var oData = {
						justification: this.selectedJustification,
						justificationText: this.selectedJustificationText,
						dataInicio: begda,
						dataFim: endda,
						horaInicio: beghour,
						horaFim: endhour,
						horas: horas

					};
					this.saveAttachment();
					var oEventBus = sap.ui.getCore().getEventBus();
					oEventBus.publish("JustificationDialogColaborador", "Justification", oData);
					this.close();
				} else {
					sap.m.MessageToast.show("Preencher campos obrigatorios", {
						duration: 3000
					});
				}
			} else {
				sap.m.MessageToast.show("Esse tipo de ausência é obrigatório anexar o documento/atestado.", {
					duration: 3000
				});
			}
		},

		checkAttachedJustificativa: function checkAttachedJustificativa(itens, jtype) {

			if (itens === 0) {
				if (jtype === "0062" || jtype === "9024" || jtype === "0060" ||
					jtype === "0059" || jtype === "0335" || jtype === "0300" ||
					jtype === "0330" || jtype === "0320" || jtype === "0310" ||
					jtype === "0027" || jtype === "0180" || jtype === "0352" ||
					jtype === "0200" || jtype === "0210" || jtype === "0250" ||
					jtype === "0260" || jtype === "0290" || jtype === "0291" ||
					jtype === "0292" || jtype === "0300" || jtype === "0310" ||
					jtype === "0320" || jtype === "0330" || jtype === "0380" ||
					jtype === "0390" || jtype === "0391" || jtype === "0392" ||
					jtype === "0393" || jtype === "9006" || jtype === "9007" ||
					jtype === "9008" || jtype === "9012" || jtype === "9020" ||
					jtype === "9021" || jtype === "9022" || jtype === "9023" ||
					jtype === "0181" || jtype === "0340") {
					return false;
				} else {
					return true;
				}
			} else {
				return true;
			}
		},

		_onButtonPress1: function () {
			var dependents = this._oView.getDependents();

			for (var i = 0; i < dependents.length; i++) {
				if (dependents[i].getProperty("title") === "Justificar") {
					dependents[i].getContent()[0].setValue("");
				}
			}

			this.selectedJustification = "";
			this.selectedJustificationTxt = "";
			this.close();

		},

		////////////////////////////////////////////////////////////////////////////////////
		// Attachemnt methods new
		////////////////////////////////////////////////////////////////////////////////////

		initAttachment: function () {
			var oModel = new JSONModel();
			this.getView().setModel(oModel, "Attachments");

			var oUploadCollection = this.getView().byId("UploadCollection");
			if (oUploadCollection) {
				oUploadCollection.setUploadUrl("/sap/opu/odata/sap/ZODHR_SS_TREATED_E_SRV/AnexoSet");
			}

			this.getView().setModel(new JSONModel({
				"selected": ["jpg", "txt", "ppt", "doc", "xls", "pdf", "png", "docx", "xlsx"]
			}), "uploadOptions");

		},

		onBeforeUpload: function (oEvent) {
			var pernr = sap.ui.getCore().getModel("TratamentoPontoColaborador").getSelectedPointTreatmentItems()[0].PERNR;
			var filename = oEvent.getParameter("fileName");
			var caracteristica = "JUSTAUSENCIA";

			// FILENAME; DMS TYPE; REQUISITION; OPERATION TYPE; CHARACTERISTIC, STATUS, PERNR
			var dados = filename + ";DCE;" + "INSERT;" + caracteristica + ";" + pernr;

			oEvent.getParameters().addHeaderParameter(new sap.m.UploadCollectionParameter({
				name: "slug",
				value: dados
			}));

		},
		onUploadComplete: function (oEvent) {
			if (oEvent.mParameters.mParameters.status !== 201) {
				MessageBox.error("Falha ao Salvar Arquivo ..!!");

			} else {
				var pernr = sap.ui.getCore().getModel("TratamentoPontoColaborador").getSelectedPointTreatmentItems()[0].PERNR;
				this.getAttachment(pernr, "DCE");
			}
		},
		saveAttachment: function () {
			var oUploadCollection = this.getView().byId("UploadCollection");
			oUploadCollection.upload();
		},
		onFilenameLength: function (oEvent) {
			MessageBox.error("Nome do Arquivo muito longo, max. 50 caracteres");
		},
		onFileSize: function (oEvent) {
			MessageBox.error("Arquivo excede tamanho máximo de 2MB");
		},

		onFilenameLengthExceed: function (oEvent) {
			MessageBox.show("Nome do Arquivo muito longo, max. 50 caracteres");
		},

		onFileSizeExceed: function (oEvent) {
			MessageBox.show("Arquivo excede tamanho máximo de 2MB");
		},

		getAttachment: function (requisition, doctype) {

			var that = this;
			var path = "/sap/opu/odata/sap/ZODHR_SS_TREATED_E_SRV/";
			var oModelData = new sap.ui.model.odata.ODataModel(path);
			var urlParam;
			if (requisition !== undefined && requisition !== null && requisition !== "") {
				urlParam = this.fFillURLFilterParam("ReqNumber", requisition);
			}

			if (doctype !== undefined && doctype !== null && doctype !== "") {
				urlParam = this.fFillURLParamFilter("DocType", doctype, urlParam);
			}

			function success(oData) {

				var oAttachments = that.getView().getModel("Attachments");
				oAttachments.setData(null);
				oAttachments.setData({
					table: []
				});

				if (oData.results.length > 0) {
					var options = that.getView().getModel("uploadOptions");
					options.getData().uploadEnabled = false;
					options.refresh();
				}

				for (var i = 0; i < oData.results.length; i++) {
					var oDataResult = oData.results[i];
					var oEntry = {};

					oEntry.documentId = oDataResult.DocumentId;
					oEntry.Filename = oDataResult.Filename;
					oEntry.Mimetype = oDataResult.Mimetype;
					oEntry.version = oDataResult.Version;
					oEntry.Fileid = oDataResult.Fileid;
					oEntry.Response = oDataResult.Response;
					oEntry.Url = path + "/AnexoSet(Pernr='',Data='" + "20200101" +
						"',DocumentId='" + oEntry.documentId + "',Version='" + "AA',Fileid='" + oEntry.Fileid + "',DocType='" + doctype +
						"')/$value";
					oEntry.TipoAnexo = oDataResult.TipoAnexo;
					oEntry.Delete = false;

					oAttachments.getData().table.push(oEntry);
				}
				oAttachments.refresh();

			}

			function error(e) {
				// MessageBox.error("Erro ao Ler anexos.");
			}

			oModelData.read("AnexoSet", null, urlParam, false, success, error);
		},

		validAttachment: function () {

			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			if (this.getView().byId("UploadCollection").getItems().length === 0) {
				MessageBox.error(oBundle.getText("erro_anexo_obrigatorio"));
				return false;
			} else {
				return true;
			}
		},

		onChangeAttachment: function (oEvent) {
			var csrfToken = this.getView().getModel("TratamentoPontoColaborador").getSecurityToken();
			var oUploadCollection = oEvent.getSource();

			if (oUploadCollection.getItems().length >= 1) {

				// MessageBox.error("É permitido apenas 1 arquivo para Envio");

			} else {

				// Header Token
				var oCustomerHeaderToken = new UploadCollectionParameter({
					name: "x-csrf-token",
					value: csrfToken
				});

				oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

			}
		}

	});
}, /* bExport= */ true);