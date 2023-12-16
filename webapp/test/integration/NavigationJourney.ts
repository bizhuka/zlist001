/*global QUnit*/
import opaTest from "sap/ui/test/opaQunit";
import App from "./pages/App";
import Worklist from "./pages/Worklist";
import Object from "./pages/Object";
import Browser from "./pages/Browser";
import Startup from "./arrangements/Startup";

export default class NavigationJourney {

	static testAll() {

		const onTheWorklistPage = new Worklist();
		const onTheObjectPage = new Object();
		const onTheBrowser = new Browser();
		const onTheAppPage = new App();

		const iDelay = 100;

		QUnit.module("Navigation");

		opaTest("Should see the objects list", function (Given: Startup) { // Given, When, Then
			// Arrangements
			Given.iStartMyApp();

			// Assertions
			onTheWorklistPage.iShouldSeeTheTable(); // Then.onTheWorklistPage
		});

		opaTest("Should react on hash change", function () { // Given, When, Then
			// Actions
			onTheWorklistPage.iRememberTheItemAtPosition(2); // When
			onTheBrowser.iChangeTheHashToTheRememberedItem(); // When

			// Assertions
			onTheObjectPage.iShouldSeeTheRememberedObject(); // Then
		});

		opaTest("Should go back to the TablePage", function () { // Given, When, Then
			// Actions
			onTheBrowser.iPressOnTheBackwardsButton(); // When

			// Assertions
			onTheWorklistPage.iShouldSeeTheTable(); // Then
		});

		opaTest("Object Page shows the correct object Details", function () { // Given, When, Then
			// Actions
			onTheWorklistPage.iRememberTheItemAtPosition(1). // When
				and.iPressATableItemAtPosition(1);

			// Assertions
			onTheObjectPage.iShouldSeeTheRememberedObject(); // Then
		});

		opaTest("Should be on the table page again when browser back is pressed", function () { // Given, When, Then
			// Actions
			onTheBrowser.iPressOnTheBackwardsButton(); // When

			// Assertions
			onTheWorklistPage.iShouldSeeTheTable(); // Then
		});

		opaTest("Should be on the object page again when browser forwards is pressed", function () { // Given, When, Then
			// Actions
			onTheBrowser.iPressOnTheForwardsButton(); // When

			// Assertions
			onTheObjectPage.iShouldSeeTheRememberedObject(); // Then

			// Cleanup
			onTheWorklistPage.iTeardownMyApp(); // Then
		});

		opaTest("Start the App and simulate metadata error: MessageBox should be shown", function (Given: Startup) { // Given, When, Then
			//Arrangement
			Given.iStartMyApp({
				delay: iDelay,
				metadataError: true
			});

			//Assertions
			onTheAppPage.iShouldSeeTheMessageBox(); // Then

			// Actions
			onTheAppPage.iCloseTheMessageBox(); // When

			// Cleanup
			onTheAppPage.iTeardownMyApp(); // Then
		});

		opaTest("Start the App and simulate bad request error: MessageBox should be shown", function (Given: Startup) { // Given, When, Then
			//Arrangement
			Given.iStartMyApp({
				delay: iDelay,
				errorType: "serverError"
			});

			//Assertions
			onTheAppPage.iShouldSeeTheMessageBox(); // Then

			// Actions
			onTheAppPage.iCloseTheMessageBox(); // When

			// Cleanup
			onTheAppPage.iTeardownMyApp(); // Then
		});

	}
}