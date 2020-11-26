function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZODHR_SS_TREATED_E_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}