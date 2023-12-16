import Opa5 from "sap/ui/test/Opa5";
import Common from "./Common";
import { SomeObject } from "../arrangements/Startup";

export default class Browser extends Common {

	// actions
	iPressOnTheBackwardsButton() {
		return this.waitFor({
			success: function () {
				// manipulate history directly for testing purposes
				Opa5.getWindow().history.back();
			}
		});
	}

	iPressOnTheForwardsButton() {
		return this.waitFor({
			success: function () {
				// manipulate history directly for testing purposes
				Opa5.getWindow().history.forward();
			}
		});
	}

	iChangeTheHashToSomethingInvalid() {
		return this.waitFor({
			success: function () {
				Opa5.getHashChanger().setHash("somethingInvalid");
			}
		});
	}

	iChangeTheHashToTheRememberedItem() {
		return this.waitFor({
			success: () => {
				const sObjectId = (Browser.getContext() as SomeObject).currentItem.id;
				Opa5.getHashChanger().setHash("Products/" + sObjectId);
			}
		});
	}

	// assertions
}