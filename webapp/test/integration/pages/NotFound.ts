import Opa5 from "sap/ui/test/Opa5";
import Common from "./Common";
import Press from "sap/ui/test/actions/Press";
import Page from "sap/m/Page";
import UI5Element from "sap/ui/core/Element";
import IllustratedMessage from "sap/m/IllustratedMessage";

export default class NotFound extends Common {
	// actions 
	iPressTheObjectNotFoundShowWorklistLink() {
		return this.waitFor({
			id: "link",
			viewName: "ObjectNotFound",
			actions: new Press(),
			errorMessage: "Did not find the link on the not found page"
		});
	}

	iPressTheNotFoundShowWorklistLink() {
		return this.waitFor({
			id: "link",
			viewName: "NotFound",
			actions: new Press(),
			errorMessage: "Did not find the link on the not found page"
		});
	}

	__iWaitUntilISeeObjectNotFoundPage() {
		return this.waitFor({
			id: "page",
			viewName: "ObjectNotFound",
			success: function (element: UI5Element) {
				const oPage = element as Page
				Opa5.assert.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("objectTitle"), "the object text is shown as title");
				//Opa5.assert.strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("noObjectFoundText"), "the object not found text is shown");
			},
			errorMessage: "Did not display the object not found text"
		});
	}

	__iWaitUntilISeeResourceNotFoundPage() {
		return this.waitFor({
			id: "page",
			viewName: "NotFound",
			success: function (element: UI5Element) {
				const oPage = element as Page
				Opa5.assert.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("notFoundTitle"), "the not found title is shown as title");
				//Opa5.assert.strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("notFoundText"), "the not found text is shown");
			},
			errorMessage: "Did not display the object not found text"
		});
	}
	
	// assertions
	iShouldSeeObjectNotFound() {
		return this.waitFor({
			id: "page",
			viewName: "ObjectNotFound",
			success: function (element: UI5Element) {
				const oPage = element as Page
				Opa5.assert.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("objectTitle"), "the object text is shown as title");
			},
			errorMessage: "Did not display the object not found page"
		}).waitFor({
			id: "notFoundIllustration",
			viewName: "ObjectNotFound",
			success: function (element: UI5Element) {
				const oIllustratedMessage = element as IllustratedMessage
				Opa5.assert.strictEqual(oIllustratedMessage.getDescription(), oIllustratedMessage.getModel("i18n").getProperty("noObjectFoundText"), "the object not found text is shown");
			},
			errorMessage: "Did not display the object not found illustration"
		});
	}

	iShouldSeeResourceNotFound() {
		return this.waitFor({
			id: "page",
			viewName: "NotFound",
			success: function (element: UI5Element) {
				const oPage = element as Page
				Opa5.assert.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("notFoundTitle"), "the not found title is shown as title");
			},
			errorMessage: "Did not display the object not found text"
		}).waitFor({
			id: "notFoundIllustration",
			viewName: "NotFound",
			success: function (element: UI5Element) {
				const oIllustratedMessage = element as IllustratedMessage
				Opa5.assert.strictEqual(oIllustratedMessage.getDescription(), oIllustratedMessage.getModel("i18n").getProperty("notFoundText"), "the not found text is shown");
			},
			errorMessage: "Did not display the object not found illustration"
		});
	}

}