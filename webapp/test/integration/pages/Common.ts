import Opa5 from "sap/ui/test/Opa5";
import MockServer from "sap/ui/core/util/MockServer";
import mockserver from "zlist001/localService/mockserver";
import Press from "sap/ui/test/actions/Press";
import PropertyStrictEquals from "sap/ui/test/matchers/PropertyStrictEquals";
import { EntitySet } from "sap/ui/model/odata/ODataMetaModel";
import ObjectNumber from "sap/m/ObjectNumber";


export type TestOption = {
	entitySet: string,
	success: (entitySetData: object) => void
}
export default class Common extends Opa5 {
	protected sViewName: string

	constructor(sViewName?: string) {
		super()
		this.sViewName = sViewName ? sViewName : '~~~Error~~~'
	}

	createAWaitForAnEntitySet(oOptions: TestOption) {
		return {
			success: () => {
				let aEntitySet: EntitySet[]

				const oMockServerInitialized = this.getMockServer().then((oMockServer) => {
					aEntitySet = oMockServer.getEntitySetData(oOptions.entitySet) as EntitySet[];
				});				
				this.iWaitForPromise(oMockServerInitialized);
				
				return this.waitFor({
					success() {
						oOptions.success.call(this, aEntitySet);
					}
				});
			}
		};
	}

	theUnitNumbersShouldHaveTwoDecimals(sControlType: string, sViewName: string, sSuccessMsg: string, sErrMsg: string) {
		const rTwoDecimalPlaces = /^-?\d+\.\d{2}$/;

		return this.waitFor({
			controlType: sControlType,
			viewName: sViewName,
			success(element:object) {
				const aNumberControls = element as ObjectNumber[]
				
				Opa5.assert.ok(aNumberControls.every(function (oNumberControl) {
					return rTwoDecimalPlaces.test(oNumberControl.getNumber());
				}), sSuccessMsg);
			},

			errorMessage: sErrMsg
		});
	}

	__iPressOnTheShareButton() {
		return this.waitFor({
			controlType: "sap.m.Button",
			viewName: this.sViewName,
			matchers: new PropertyStrictEquals({
				name: "icon",
				value: "sap-icon://action"
			}),
			actions: new Press(),
			errorMessage: "Did not find the share button"
		});
	}

	__iShouldSeeTheShareEmailButton() {
		return this.waitFor({
			viewName: this.sViewName,
			id: "shareEmail-button",
			matchers: new PropertyStrictEquals({
				name: "icon",
				value: "sap-icon://email"
			}),
			success: function () {
				Opa5.assert.ok(true, "The E-Mail button is visible");
			},
			errorMessage: "The E-Mail button was not found"
		});
	}

	getMockServer() {
		return new Promise<MockServer>(function (success) {
			// sap.ui.require(["zlist001/localService/mockserver"], function (mockserver: mockserver) {	
			success(mockserver.getMockServer());
			// });
		});
	}
}