/*global QUnit*/
import opaTest from "sap/ui/test/opaQunit";
import Worklist from "./pages/Worklist";
import Object from "./pages/Object";
import Startup from "./arrangements/Startup";

export default class ObjectJourney {

	static testAll() {

		const onTheWorklistPage = new Worklist();
		const onTheObjectPage = new Object();

		QUnit.module("Object");

		opaTest("Should remember the first item", function (Given: Startup) { // Given, When, Then
			// Arrangements
			Given.iStartMyApp();

			//Actions
			onTheWorklistPage.iRememberTheItemAtPosition(1); // When

			// Assertions
			onTheWorklistPage.theTitleShouldDisplayTheTotalAmountOfItems(); // Then

			// Cleanup
			onTheWorklistPage.iTeardownMyApp(); // Then
		});

		opaTest("Should start the app with remembered item", function (Given: Startup) { // Given, When, Then
			// Arrangements
			Given.iRestartTheAppWithTheRememberedItem({
				delay: 1000
			});

			// Assertions
			onTheObjectPage.iShouldSeeTheObjectViewsBusyIndicator(). // Then
				and.theObjectViewsBusyIndicatorDelayIsRestored().
				and.iShouldSeeTheRememberedObject().
				and.theObjectViewShouldContainOnlyFormattedUnitNumbers();

			// Cleanup
			onTheObjectPage.iTeardownMyApp(); // Then

		});

	}
}
