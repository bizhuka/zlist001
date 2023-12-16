import Common from "./Common";
import Opa5 from "sap/ui/test/Opa5";
import UI5Element from "sap/ui/core/Element";

// "sap/ui/test/matchers/PropertyStrictEquals"

export default class App extends Common {

	// actions
	iCloseTheMessageBox() {		
		return this.waitFor({
			id: "serviceErrorMessageBox",
			autoWait: false,
			success: function (oMessageBox: UI5Element) {
				oMessageBox.destroy();
				Opa5.assert.ok(true, "The MessageBox was closed");
			}
		});
	}

	// assertions
	iShouldSeeTheMessageBox() {
		return this.waitFor({
			id: "serviceErrorMessageBox",
			autoWait: false,
			success: function () {
				Opa5.assert.ok(true, "The correct MessageBox was shown");
			}
		});
	}
}