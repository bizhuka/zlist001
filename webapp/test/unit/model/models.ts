/*global QUnit*/

// import * as sinon from "sap/ui/thirdparty/sinon";
// import * as Sinon from "sinon";
import Device from "sap/ui/Device";
import models from "zlist001/model/models";
import JSONModel from "sap/ui/model/json/JSONModel";
import BindingMode from "sap/ui/model/BindingMode";

export { }

type QUnitEqual = {
	strictEqual: (actual: boolean | BindingMode, expected: boolean | BindingMode, message: string) => void
}
class SinonSandbox {
	stub: (real: object, name: string, fake: object) => void
}

let oDeviceModel: JSONModel

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
function isPhoneTestCase(this: SinonSandbox, assert: QUnitEqual, bIsPhone: boolean) {
	// Arrange
	this.stub(Device, "system", { phone: bIsPhone });

	// System under test
	oDeviceModel = models.createDeviceModel();

	// Assert
	assert.strictEqual((oDeviceModel.getData() as Device).system.phone, bIsPhone, "IsPhone property is correct");
}

function isTouchTestCase(this: SinonSandbox, assert: QUnitEqual, bIsTouch: boolean) {
	// Arrange
	this.stub(Device, "support", { touch: bIsTouch });

	// System under test
	oDeviceModel = models.createDeviceModel();

	// Assert
	assert.strictEqual((oDeviceModel.getData() as Device).support.touch, bIsTouch, "IsTouch property is correct");
}
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////


QUnit.module("createDeviceModel", {
	afterEach: function () {
		oDeviceModel.destroy();
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

QUnit.test("Should initialize a device model for desktop", function (this: SinonSandbox, assert) {
	isPhoneTestCase.call(this, assert, false);
});

QUnit.test("Should initialize a device model for phone", function (this: SinonSandbox, assert) {
	isPhoneTestCase.call(this, assert, true);
});

////////////////////////////////////////////////////////////////////////////////////////////////////

QUnit.test("Should initialize a device model for non touch devices", function (this: SinonSandbox, assert: QUnitEqual) {
	isTouchTestCase.call(this, assert, false);
});

QUnit.test("Should initialize a device model for touch devices", function (this: SinonSandbox, assert: QUnitEqual) {
	isTouchTestCase.call(this, assert, true);
});

////////////////////////////////////////////////////////////////////////////////////////////////////

QUnit.test("The binding mode of the device model should be one way", function (this: SinonSandbox, assert: QUnitEqual) {
	// System under test
	oDeviceModel = models.createDeviceModel();

	// Assert
	assert.strictEqual(oDeviceModel.getDefaultBindingMode() as BindingMode, BindingMode.OneWay, "Binding mode is correct");
});