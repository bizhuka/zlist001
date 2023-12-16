import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";

/**
 * @namespace zlist001.controller
 */
export default class App extends BaseController {
	public onInit(): void {
		const iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

		const oViewModel = new JSONModel({
			busy : true,
			delay : 0
		});
		this.setModel(oViewModel, "appView");

		const fnSetAppNotBusy = function() {
			oViewModel.setProperty("/busy", false);
			oViewModel.setProperty("/delay", iOriginalBusyDelay);
		};

		// disable busy indication when the metadata is loaded and in case of errors
		void (this.getModel() as ODataModel).metadataLoaded().then(fnSetAppNotBusy);
		void (this.getModel() as ODataModel).attachMetadataFailed(fnSetAppNotBusy);

		// apply content density mode to root view
		this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
	}
}
