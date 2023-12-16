/*global QUnit*/

import formatter from "zlist001/model/formatter";


type QUnitEqual = {
	strictEqual: (actual: string, expected: string, message: string) => void
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
QUnit.module("Number unit");

function numberUnitValueTestCase(assert: QUnitEqual, sValue: string, fExpectedNumber: string) {
	// Act
	const fNumber = formatter.numberUnit(sValue);

	// Assert
	assert.strictEqual(fNumber, fExpectedNumber, "The rounding was correct");
}
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

QUnit.test("Should round down a 3 digit number", function (this: QUnitEqual, assert) {
	numberUnitValueTestCase.call(this, assert, "3.123", "3.12");
});

QUnit.test("Should round up a 3 digit number", function (this: QUnitEqual, assert) {
	numberUnitValueTestCase.call(this, assert, "3.128", "3.13");
});

QUnit.test("Should round a negative number", function (this: QUnitEqual, assert) {
	numberUnitValueTestCase.call(this, assert, "-3", "-3.00");
});

QUnit.test("Should round an empty string", function (this: QUnitEqual, assert) {
	numberUnitValueTestCase.call(this, assert, "", "");
});

QUnit.test("Should round a zero", function (this: QUnitEqual, assert) {
	numberUnitValueTestCase.call(this, assert, "0", "0.00");
});