import UIComponent from "sap/ui/core/UIComponent";
import models from "./model/models";
import Device from "sap/ui/Device";
import ErrorHandler from "./controller/ErrorHandler";

/**
 * @namespace zlist001
 */
export default class Component extends UIComponent {
	public static metadata = {
		manifest: "json",
	};

	private contentDensityClass: string;
	private _oErrorHandler: ErrorHandler

	/**
	 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
	 * In this function, the device models are set and the router is initialized.
	 * @override
	*/
	public init(): void {
		// call the base component's init function
		super.init();

		// initialize the error handler with the component
		this._oErrorHandler = new ErrorHandler(this);

		// create the device model
		this.setModel(models.createDeviceModel(), "device");

		// set the product feedback model
		this.setModel(models.createCommentsModel(), "productFeedback");

		// create the views based on the url/hash
		this.getRouter().initialize();
	}

	/**
	 * The component is destroyed by UI5 automatically.
	 * In this method, the ErrorHandler is destroyed.
	 * @override
	*/
	public destroy() {
		this._oErrorHandler.destroy();
		// call the base component's destroy function
		super.destroy()
	}

	/**
	 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
	 * design mode class should be set, which influences the size appearance of some controls.
	 * @returns css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
	 */
	public getContentDensityClass(): string {
		if (this.contentDensityClass === undefined) {
			// check whether FLP has already set the content density class; do nothing in this case
			if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
				this.contentDensityClass = "";
			} else if (!Device.support.touch) {
				// apply "compact" mode if touch is not supported
				this.contentDensityClass = "sapUiSizeCompact";
			} else {
				// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
				this.contentDensityClass = "sapUiSizeCozy";
			}
		}
		return this.contentDensityClass;
	}
}
