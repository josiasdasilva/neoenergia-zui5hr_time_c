sap.ui.define([
  "sap/ui/base/ManagedObject",
  "sap/m/MessageBox",
  "./utilities",
  "sap/ui/core/routing/History"
], function(ManagedObject, MessageBox, Utilities, History) {

  return ManagedObject.extend("com.neo.ZODHR_SS_TIME_C.controller.Dialog11", {
    constructor: function(oView) {
      this._oView = oView;
      this._oControl = sap.ui.xmlfragment(oView.getId(), "com.neo.ZODHR_SS_TIME_C.view.Dialog11", this);
      this._bInit = false;
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

    open: function(oEvent) {
      $("#" + oEvent.getContent()[1].getItems()[0].getContent()[2].getId()).find(".sapUiCalDatesRow").css("display", "none");
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

    close: function() {
      this._oControl.close();
    },

    setRouter: function(oRouter) {
      this.oRouter = oRouter;

    },
    getBindingParameters: function() {
      return {};

    },
    handleRadioButtonGroupsSelectedIndex: function() {
      var that = this;
      this.aRadioButtonGroupIds.forEach(function(sRadioButtonGroupId) {
        var oRadioButtonGroup = that.byId(sRadioButtonGroupId);
        var oButtonsBinding = oRadioButtonGroup ? oRadioButtonGroup.getBinding("buttons") : undefined;
        if (oButtonsBinding) {
          var oSelectedIndexBinding = oRadioButtonGroup.getBinding("selectedIndex");
          var iSelectedIndex = oRadioButtonGroup.getSelectedIndex();
          oButtonsBinding.attachEventOnce("change", function() {
            if (oSelectedIndexBinding) {
              oSelectedIndexBinding.refresh(true);
            } else {
              oRadioButtonGroup.setSelectedIndex(iSelectedIndex);
            }
          });
        }
      });

    },
    convertTextToIndexFormatter: function(sTextValue) {
      var oRadioButtonGroup = this.byId("sap_m_Dialog_0-D4_1537800889454-D10_1537879767679-content-sap_m_RadioButtonGroup-1537970554231");
      var oButtonsBindingInfo = oRadioButtonGroup.getBindingInfo("buttons");
      if (oButtonsBindingInfo && oButtonsBindingInfo.binding) {
        // look up index in bound context
        var sTextBindingPath = oButtonsBindingInfo.template.getBindingPath("text");
        return oButtonsBindingInfo.binding.getContexts(oButtonsBindingInfo.startIndex, oButtonsBindingInfo.length).findIndex(function(oButtonContext) {
          return oButtonContext.getProperty(sTextBindingPath) === sTextValue;
        });
      } else {
        // look up index in static items
        return oRadioButtonGroup.getButtons().findIndex(function(oButton) {
          return oButton.getText() === sTextValue;
        });
      }

    },
    _onRadioButtonGroupSelect: function() {

    },
    _onButtonPress: function(oEvent) {
      oEvent = jQuery.extend(true, {}, oEvent);
      return new Promise(function(fnResolve) {
          fnResolve(true);
        })
        .then(function(result) {

          this.close();

        }.bind(this))
        .then(function(result) {
          if (result === false) {
            return false;
          } else {
            return new Promise(function(fnResolve) {
              sap.m.MessageBox.confirm("Troca de horário não permitida. Solicitar troca de horário ao RH?", {
                title: "Confirmar Solicitação",
                actions: ["Solicitar", "Cancelar"],
                onClose: function(sActionClicked) {
                  fnResolve(sActionClicked === "Solicitar");
                }
              });
            });

          }
        }.bind(this))
        .then(function(result) {
          if (result === false) {
            return false;
          } else {
            return new Promise(function(fnResolve) {
              var sTargetPos = "center center";
              sTargetPos = (sTargetPos === "default") ? undefined : sTargetPos;
              sap.m.MessageToast.show("Solicitação encaminhada ao RH", {
                onClose: fnResolve,
                duration: 2000 || 3000,
                at: sTargetPos,
                my: sTargetPos
              });
            });

          }
        }.bind(this)).catch(function(err) {
          if (err !== undefined) {
            MessageBox.error(err.message);
          }
        });
    },
    _onButtonPress1: function() {

      this.close();

    },
    onInit: function() {

      this._oDialog = this.getControl();

    },
    onExit: function() {
      this._oDialog.destroy();

    }

  });
}, /* bExport= */ true);