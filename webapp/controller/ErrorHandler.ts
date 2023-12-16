import ResourceBundle from "sap/base/i18n/ResourceBundle";
import MessageBox from "sap/m/MessageBox";
import UI5Object from "sap/ui/base/Object";
import { Model$RequestFailedEventParameters } from "sap/ui/model/Model";
import ODataModel, { ODataModel$RequestFailedEvent } from "sap/ui/model/odata/v2/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Component from "zlist001/Component";

/**
 * @namespace zlist001.controller
*/

export default class ErrorHandler extends UI5Object {
	private _oResourceBundle: ResourceBundle
	private _oComponent: Component
	private _oModel: ODataModel
	private _bMessageOpen: boolean
	private _sErrorText: string

	/**
	 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
	 * @class
	 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
	 */
	public constructor(oComponent: Component) {
		super();
		this._oResourceBundle = (oComponent.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
		this._oComponent = oComponent;
		this._oModel = oComponent.getModel() as ODataModel;
		this._bMessageOpen = false;
		this._sErrorText = this._oResourceBundle.getText("errorText");

		this._oModel.attachMetadataFailed((oEvent) => {
			const oParams = oEvent.getParameters();
			this._showServiceError(oParams.response);
		});

		this._oModel.attachRequestFailed((oEvent: ODataModel$RequestFailedEvent) => {
			const oResponse = oEvent.getParameters().response as Model$RequestFailedEventParameters
			// An entity that was not found in the service is also throwing a 404 error in oData.
			// We already cover this case with a notFound target so we skip it here.
			// A request that cannot be sent to the server is a technical error that we have to handle though
			if (oResponse.statusCode !== "404" || (parseInt(oResponse.statusCode) === 404 && oResponse.responseText.indexOf("Cannot POST") === 0)) {
				this._showServiceError(oResponse);
			}
		});
	}

	/**
	 * Shows a MessageBox when a service call has failed.
	 * Only the first error message will be display.
	 * @param {string}? sDetails a technical error to be displayed on request
	 */
	private _showServiceError(sDetails: object) {
		if (this._bMessageOpen) {
			return;
		}
		this._bMessageOpen = true;
		MessageBox.error(
			this._sErrorText,
			{
				id: "serviceErrorMessageBox",
				details: sDetails,
				styleClass: this._oComponent.getContentDensityClass(),
				actions: [MessageBox.Action.CLOSE],
				onClose: () => {
					this._bMessageOpen = false;
				}
			}
		);
	}
}