import Press from "sap/ui/test/actions/Press";
import Common from "./Common";
import Opa5 from "sap/ui/test/Opa5";
import PropertyStrictEquals from "sap/ui/test/matchers/PropertyStrictEquals";
import { SomeObject } from "../arrangements/Startup";
import UI5Element from "sap/ui/core/Element";
import Page from "sap/m/Page";

export default class App extends Common {

	constructor() {
		super("Object")
	}

	// actions
	iPressTheBackButton() {
		return this.waitFor({
			id: "page",
			viewName: this.sViewName,
			actions: new Press(),
			errorMessage: "Did not find the nav button on object page"
		});
	}

	// assertions
	iShouldSeeTheRememberedObject() {
		return this.waitFor({
			success: () => {
				const sBindingPath = (Opa5.getContext() as SomeObject).currentItem.bindingPath;
				this.waitFor({
					id: "page",
					viewName: this.sViewName,
					matchers: function (element: UI5Element) {
						const oPage = element as Page
						return oPage.getBindingContext() && oPage.getBindingContext().getPath() === sBindingPath;
					},
					success: function (element: UI5Element) {
						const oPage = element as Page
						Opa5.assert.strictEqual(oPage.getBindingContext().getPath(), sBindingPath, "was on the remembered detail page");
					},
					errorMessage: "Remembered object " + sBindingPath + " is not shown"
				});
			}
		});
	}

	iShouldSeeTheObjectViewsBusyIndicator() {
		return this.waitFor({
			id: "page",
			viewName: this.sViewName,
			matchers: function (element: UI5Element) {
				const oPage = element as Page
				return oPage.getBusy();
			},
			autoWait: false,
			pollingInterval: 100,
			success: function (element: UI5Element) {
				const oPage = element as Page
				Opa5.assert.ok(oPage.getBusy(), "The object view is busy");
			},
			errorMessage: "The object view is not busy"
		});
	}

	theObjectViewsBusyIndicatorDelayIsRestored() {
		return this.waitFor({
			id: "page",
			viewName: this.sViewName,
			matchers: new PropertyStrictEquals({
				name: "busyIndicatorDelay",
				value: 1000
			}),
			success: function () {
				Opa5.assert.ok(true, "The object view's busy indicator delay default is restored.");
			},
			errorMessage: "The object view's busy indicator delay is still zero."
		});
	}

	theObjectViewShouldContainOnlyFormattedUnitNumbers() {
		return this.theUnitNumbersShouldHaveTwoDecimals(
			"sap.m.ObjectNumber", // All ObjectNumbers
			this.sViewName,
			"Object numbers are properly formatted",
			"Object view has no entries which can be checked for their formatting");
	}

	__theViewIsNotBusyAnymore() {
		return this.waitFor({
			id: "page",
			viewName: this.sViewName,
			matchers: function (element: UI5Element) {
				const oPage = element as Page
				return !oPage.getBusy();
			},
			autoWait: false,
			success: function (element: UI5Element) {
				const oPage = element as Page
				Opa5.assert.ok(!oPage.getBusy(), "The object view is not busy");
			},
			errorMessage: "The object view is busy"
		});
	}

	__theObjectViewsBusyIndicatorDelayIsZero() {
		return this.waitFor({
			id: "page",
			viewName: this.sViewName,
			success: function (element: UI5Element) {
				const oPage = element as Page
				Opa5.assert.strictEqual(oPage.getBusyIndicatorDelay(), 0, "The object view's busy indicator delay is zero.");
			},
			errorMessage: "The object view's busy indicator delay is not zero."
		});
	}

	__theShareTileButtonShouldContainTheRememberedObjectName() {
		return this.waitFor({
			id: "shareTile", // not found in XML
			viewName: this.sViewName,
			matchers: function (element: UI5Element) {
				const oButton = element as Page // ?
				const sObjectName = (Opa5.getContext() as SomeObject).currentItem.name;
				const sTitle = oButton.getTitle();
				return sTitle && sTitle.indexOf(sObjectName) > -1;
			}.bind(this),
			success: function () {
				Opa5.assert.ok(true, "The Save as Tile button contains the object name");
			},
			errorMessage: "The Save as Tile did not contain the object name"
		});
	}

}