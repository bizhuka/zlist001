import MessageBox from "sap/m/MessageBox";
import mockserver from "zlist001/localService/mockserver";


export default class InitMockServer {

	static {
		// initialize the mock server
		try {
			void mockserver.init();
		} catch (oError) {
			MessageBox.error((oError as Error).message);
		}

		// initialize the embedded component on the HTML page
		sap.ui.require(["sap/ui/core/ComponentSupport"]);
	}
}
