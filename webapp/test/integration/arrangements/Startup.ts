import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Opa5 from "sap/ui/test/Opa5";
import mockserver, { Option } from "zlist001/localService/mockserver";


export type CurrentItem = {
	id: string,
	bindingPath?: string,
	name?: string
}

export type SomeObject = {
	currentItem: CurrentItem
}

export default class Startup extends Opa5 {
	private sObjectId: string

	/**
	 * Initializes mock server, then starts the app component
	 * @param {object} oOptionsParameter An object that contains the configuration for starting up the app
	 * @param {int} oOptionsParameter.delay A custom delay to start the app with
	 * @param {string} [oOptionsParameter.hash] The in-app hash can also be passed separately for better readability in tests
	 * @param {boolean} [oOptionsParameter.autoWait=true] Automatically wait for pending requests while the application is starting up
	 */
	iStartMyApp(oOptionsParameter?: Option) {
		const oOptions = oOptionsParameter || {} as Option;

		this._clearSharedData();

		// start the app with a minimal delay to make tests fast but still async to discover basic timing issues
		oOptions.delay = oOptions.delay || 1;

		// configure mock server with the current options
		const oMockserverInitialized = mockserver.init(oOptions);

		this.iWaitForPromise(oMockserverInitialized);
		// start the app UI component
		this.iStartMyUIComponent({
			componentConfig: {
				name: "zlist001",
				async: true
			},
			hash: oOptions.hash,
			autoWait: oOptions.autoWait
		});
	}

	iRestartTheAppWithTheRememberedItem(oOptions: Option) {
		this.waitFor({
			success: () => {
				this.sObjectId = (Opa5.getContext() as SomeObject).currentItem.id;
			}
		});

		return this.waitFor({
			success: () => {
				oOptions.hash = "Products/" + encodeURIComponent(this.sObjectId);
				this.iStartMyApp(oOptions);
			}
		});
	}

	_clearSharedData() {
		// clear shared metadata in ODataModel to allow tests for loading the metadata
		ODataModel.mSharedData = { server: {}, service: {}, meta: {} };
	}

}