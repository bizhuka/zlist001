/*global QUnit*/
import opaTest from "sap/ui/test/opaQunit";
import Worklist from "./pages/Worklist";
import Startup from "./arrangements/Startup";


export default class WorklistJourney {
	static testAll() {

		const onTheWorklistPage = new Worklist();		
		QUnit.module("Worklist");

		opaTest("Should see the table with all entries", function (Given: Startup) { // Given, When, Then
			// Arrangements
			Given.iStartMyApp();

			// Assertions
			onTheWorklistPage.theTableShouldHaveAllEntries().  // Then.onTheWorklistPage
				and.theTableShouldContainOnlyFormattedUnitNumbers().
				and.theTitleShouldDisplayTheTotalAmountOfItems();
		});

		opaTest("Search for the First object should deliver results that contain the firstObject in the name", function () { // Given, When, Then
			//Actions
			onTheWorklistPage.iSearchForTheFirstObject(); // When.onTheWorklistPage

			// Assertions
			onTheWorklistPage.theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle(); // Then.onTheWorklistPage
		});

		opaTest("Entering something that cannot be found into search field and pressing search field's refresh should leave the list as it was", function () { // Given, When, Then
			//Actions
			onTheWorklistPage.iTypeSomethingInTheSearchThatCannotBeFoundAndTriggerRefresh(); //When.onTheWorklistPage

			// Assertions
			onTheWorklistPage.theTableHasEntries(); // Then.onTheWorklistPage

			// Cleanup
			onTheWorklistPage.iTeardownMyApp(); //Then
		});
	}
}