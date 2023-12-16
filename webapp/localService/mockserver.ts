// import Log from "sap/base/Log";
import MockServer, { RequestHandler, Response } from "sap/ui/core/util/MockServer";
import JSONModel from "sap/ui/model/json/JSONModel";


// An object that contains the configuration for starting up the app
export type Option = {
	hash?: string,      // The in app hash can also be passed separately for better readability in tests
	autoWait?: boolean, // Automatically wait for pending requests while the application is starting up. =true
	delay?: number     // A custom delay to start the app with
	errorType?: string
	metadataError?: boolean
}

type MockService = {
	uri: string,
	settings: {
		localUri: string
	}
}

export default class mockserver {
	private static oMockServer: MockServer
	
	/**
	 * Initializes the mock server asynchronously.
	 * You can configure the delay with the URL parameter "serverDelay".
	 * The local mock data in this folder is returned instead of the real data for testing.
	 * @protected
	 * @param {object} [oOptionsParameter] init parameters for the mockserver
	 * @returns{Promise} a promise that is resolved when the mock server has been started
	*/

	public static init(oOptionsParameter?: Option): Promise<void> { //
		const oOptions = oOptionsParameter || {} as Option;

		const _sAppPath = "zlist001/",
			_sJsonFilesPath = _sAppPath + "localService/mockdata";

		return new Promise<void>((fnResolve, fnReject) => {
			const sManifestUrl = sap.ui.require.toUrl(_sAppPath + "manifest.json"),
				oManifestModel = new JSONModel(sManifestUrl);

			oManifestModel.attachRequestCompleted(() => {

				const oUriParameters = new URLSearchParams(window.location.search)
				// parse manifest for local metadata URI
				const sJsonFilesUrl = sap.ui.require.toUrl(_sJsonFilesPath)
				const oMainDataSource = oManifestModel.getProperty("/sap.app/dataSources/mainService") as MockService
				const sMetadataUrl = sap.ui.require.toUrl(_sAppPath + oMainDataSource.settings.localUri)
				// ensure there is a trailing slash
				const sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ? oMainDataSource.uri : oMainDataSource.uri + "/";

				// create a mock server instance or stop the existing one to reinitialize
				if (!this.oMockServer) {
					this.oMockServer = new MockServer({
						rootUri: sMockServerUrl
					});
				} else {
					this.oMockServer.stop();
				}

				// configure mock server with the given options or a default delay of 0.5s
				MockServer.config({
					autoRespond: true,
					autoRespondAfter: (oOptions.delay || Number(oUriParameters.get("serverDelay")) || 500)
				});

				// simulate all requests using mock data
				this.oMockServer.simulate(sMetadataUrl, {
					sMockdataBaseUrl: sJsonFilesUrl,
					bGenerateMissingMockData: true
				});

				const aRequests = this.oMockServer.getRequests();

				// compose an error response for requesti
				const fnResponse = function (iErrCode: number, sMessage: string, aRequest: RequestHandler) {
					aRequest.response = function (oXhr: Response) {
						oXhr.respond(iErrCode, { "Content-Type": "text/plain;charset=utf-8" }, sMessage);
					};
				};

				// simulate metadata errors
				if (oOptions.metadataError || oUriParameters.get("metadataError")) {
					aRequests.forEach(function (aEntry) {
						if (aEntry.path.toString().indexOf("$metadata") > -1) {
							fnResponse(500, "metadata Error", aEntry);
						}
					});
				}

				// simulate request errors
				const sErrorParam = oOptions.errorType || oUriParameters.get("errorType"),
					iErrorCode = sErrorParam === "badRequest" ? 400 : 500;
				if (sErrorParam) {
					aRequests.forEach(function (aEntry) {
						fnResponse(iErrorCode, sErrorParam, aEntry);
					});
				}

				// custom mock behaviour may be added here

				// set requests and start the server
				this.oMockServer.setRequests(aRequests);
				this.oMockServer.start();

				//  Log.info("Running the app with mock data");
				console.info("Running the app with mock data")

				fnResolve();
			});

			oManifestModel.attachRequestFailed(function () {
				const sError = "Failed to load application manifest";

				//Log.error(sError);
				console.error(sError);
				fnReject(new Error(sError));
			});
		});
	}

	/**
	 * @public returns the mockserver of the app, should be used in integration tests
	 * @returns {sap.ui.core.util.MockServer} the mockserver instance
	*/
	public static getMockServer() {
		return this.oMockServer;
	}
}