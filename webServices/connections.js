sap.ui.define([
	"sap/ui/base/Object",
], function (Object) {
	"use strict";

	var services = {
		url: "/sap/opu/odata/sap/ZODHR_SS_TREATED_E_SRV/",
		consumeModel: function (params, successCb, errorCb, urlParametersX, filter) {
			var oModel = new sap.ui.model.odata.v2.ODataModel(this.url);
			oModel.read(params, {
				urlParameters: urlParametersX,
				filters: filter,
				async: false,
				success: function (oData, oResponse) {
					successCb(oData, oResponse);
				},
				error: function (err) {
						errorCb(err);
					}
					// }, this);
			});
		},
		createModel: function (params, object, successCb, errorCb, urlParameters) {
			var oModel = new sap.ui.model.odata.v2.ODataModel(this.url);
			// oModel.setHeaders({"X-Requested-With" : "X" });
			oModel.create(params, object, {
				urlParameters: {
					tokenHendling: false,
					disebleHeaedRequestForToken: true
				},
				//method: "PUT",
				success: function (oData, oResponse) {
					successCb(oData, oResponse);
				},
				error: function (err) {
					errorCb(err);
				}
			});
		},
		deleteModel: function (params, object, successCb, errorCb, urlParameters) {
			var oModel = new sap.ui.model.odata.v2.ODataModel(this.url);
			// oModel.setHeaders({"X-Requested-With" : "X" });
			oModel.remove(params, {
				urlParameters: {
					tokenHendling: false,
					disebleHeaedRequestForToken: true
				},
				//method: "PUT",
				success: function (oData, oResponse) {
					successCb(oData, oResponse);
				},
				error: function (err) {
					errorCb(err);
				}
			});
		},
		updateModel: function (params, object, successCb, errorCb) {
			var oModel = new sap.ui.model.odata.ODataModel(this.url, true);
			// oModel.setHeaders({"X-Requested-With" : "X" });
			oModel.update(params, object, {
				async: true,
				success: function (oData, oResponse) {
					successCb(oData, oResponse);
				},
				error: function (err) {
					errorCb(err);
				}
			});
		}
	};
	return services;
});