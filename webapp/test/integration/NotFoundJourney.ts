/*global QUnit*/
import opaTest from "sap/ui/test/opaQunit";
import Worklist from "./pages/Worklist";
import NotFound from "./pages/NotFound";
import Browser from "./pages/Browser";
import Startup from "./arrangements/Startup";

export default class NotFoundJourney {

	static testAll() {

		const onTheWorklistPage = new Worklist();
		const onTheNotFoundPage = new NotFound();
		const onTheBrowser = new Browser();

		QUnit.module("NotFound");

		opaTest("Should see the resource not found page when changing to an invalid hash", function (Given: Startup) { //Given, When, Then
			//Arrangement
			Given.iStartMyApp();

			//Actions
			onTheBrowser.iChangeTheHashToSomethingInvalid(); // When

			// Assertions
			onTheNotFoundPage.iShouldSeeResourceNotFound(); //Then
		});

		opaTest("Clicking the 'Show my worklist' link on the 'Resource not found' page should bring me back to the worklist", function () { //Given, When, Then
			//Actions
			onTheNotFoundPage.iPressTheNotFoundShowWorklistLink(); // When

			// Assertions
			onTheWorklistPage.iShouldSeeTheTable(); // Then
		});

		opaTest("Should see the not found text for no search results", function () { //Given, When, Then
			//Actions
			onTheWorklistPage.iSearchForSomethingWithNoResults(); // When

			// Assertions
			onTheWorklistPage.iShouldSeeTheNoDataTextForNoSearchResults(); // Then
		});

		opaTest("Clicking the back button should take me back to the not found page", function () { //Given, When, Then
			//Actions
			onTheBrowser.iPressOnTheBackwardsButton(); // When

			// Assertions
			onTheNotFoundPage.iShouldSeeResourceNotFound(); // Then

			// Cleanup
			onTheNotFoundPage.iTeardownMyApp(); // Then
		});

		opaTest("Should see the 'Object not found' page if an invalid object id has been called", function (Given: Startup) { //Given, When, Then
			Given.iStartMyApp({
				hash: "Products/SomeInvalidObjectId"
			});

			// Assertions
			onTheNotFoundPage.iShouldSeeObjectNotFound(); // Then
		});

		opaTest("Clicking the 'Show my worklist' link on the 'Object not found' page should bring me back to the worklist", function () { //Given, When, Then
			//Actions
			onTheNotFoundPage.iPressTheObjectNotFoundShowWorklistLink(); // When

			// Assertions
			onTheWorklistPage.iShouldSeeTheTable(); // Then

			// Cleanup
			onTheNotFoundPage.iTeardownMyApp(); // Then
		});

	}
}