import UI5Element from "sap/ui/core/Element";
import Common from "./Common";
import Table from "sap/m/Table";
import SearchField from "sap/m/SearchField";
import Press from "sap/ui/test/actions/Press";
import AggregationFilled from "sap/ui/test/matchers/AggregationFilled";
import EnterText from "sap/ui/test/actions/EnterText";
import Opa5, { Action } from "sap/ui/test/Opa5";
import AggregationLengthEquals from "sap/ui/test/matchers/AggregationLengthEquals";
import PropertyStrictEquals from "sap/ui/test/matchers/PropertyStrictEquals";
import { EntitySet } from "sap/ui/model/odata/ODataMetaModel";
import ColumnListItem from "sap/m/ColumnListItem";
import ObjectIdentifier from "sap/m/ObjectIdentifier";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Page from "sap/m/Page";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ListBinding from "sap/ui/model/ListBinding";
import { CurrentItem } from "../arrangements/Startup";


type PosOption = {
	position: number
	actions?: Press
	success?: (element: UI5Element) => void
}

export default class Worklist extends Common {
	private sTableId = "table"
	private sSearchFieldId = "searchField"
	private sSomethingThatCannotBeFound = "*#-Q@@||"

	constructor() {
		super("Worklist")
	}

	allItemsInTheListContainTheSearchTerm(aControls: UI5Element[]): boolean {
		const oTable = aControls[1] as Table                 // [0] is after SearchField
		const oSearchField = aControls[0] as SearchField     // [1] is before table in the DOM
		const aItems = oTable.getItems() as ColumnListItem[];

		// table needs items
		if (aItems.length === 0) {
			return false;
		}

		return aItems.every(function (oItem) {
			return (oItem.getCells()[0] as ObjectIdentifier).getTitle().indexOf(oSearchField.getValue()) !== -1;
		});
	}

	createWaitForItemAtPosition(oOptions: PosOption) {
		const iPosition = oOptions.position;
		return {
			id: this.sTableId,
			viewName: this.sViewName,
			matchers: function (element: UI5Element) {
				const oTable = element as Table
				return oTable.getItems()[iPosition];
			},
			actions: oOptions.actions,
			success: oOptions.success,
			errorMessage: "Table in view '" + this.sViewName + "' does not contain an Item at position '" + iPosition + "'"
		};
	}

	// actions
	iPressATableItemAtPosition(iPosition: number) {
		return this.waitFor(this.createWaitForItemAtPosition({
			position: iPosition,
			actions: new Press()
		}));
	}

	iRememberTheItemAtPosition(iPosition: number) {
		return this.waitFor(this.createWaitForItemAtPosition({
			position: iPosition,
			success: function (element: UI5Element) {
				const oTableItem = element as ColumnListItem
				const oBindingContext = oTableItem.getBindingContext();

				// Don't remember objects just strings since IE will not allow accessing objects of destroyed frames
				Opa5.getContext().currentItem = {
					bindingPath: oBindingContext.getPath(),
					id: oBindingContext.getProperty("ProductID") as string,
					name: oBindingContext.getProperty("ProductName") as string
				} as CurrentItem;
			}
		}));
	}

	__iPressOnMoreData() {
		return this.waitFor({
			id: this.sTableId + '-trigger',
			viewName: this.sViewName,
			// matchers: function (oTable) {
			// 	return !!oTable.$("trigger").length;
			// },
			actions: new Press(),
			errorMessage: "The Table does not have a trigger"
		});
	}

	iSearchForTheFirstObject() {

		return this.waitFor({
			id: this.sTableId,
			viewName: this.sViewName,
			matchers: new AggregationFilled({
				name: "items"
			}),
			success: (element: UI5Element) => {
				const oTable = element as Table
				const oColumnListItem = oTable.getItems()[0] as ColumnListItem
				const sFirstObjectTitle = (oColumnListItem.getCells()[0] as ObjectIdentifier).getTitle();

				this.iSearchForValue(sFirstObjectTitle);

				this.waitFor({
					id: new RegExp(`^(${this.sTableId}|${this.sSearchFieldId})$`), // [this.sTableId, this.sSearchFieldId],
					viewName: this.sViewName,
					check: this.allItemsInTheListContainTheSearchTerm.bind(this),
					errorMessage: "Did not find any table entries or too many while trying to search for the first object."
				});
			},
			errorMessage: "Did not find table entries while trying to search for the first object."
		});
	}

	iSearchForValueWithActions(aActions: Action[] | Action) {
		return this.waitFor({
			id: this.sSearchFieldId,
			viewName: this.sViewName,
			actions: aActions,
			errorMessage: "Failed to find search field in Worklist view.'"
		});
	}

	iSearchForValue(sSearchString: string) {
		return this.iSearchForValueWithActions([new EnterText({ text: sSearchString }), new Press()]);
	}

	iTypeSomethingInTheSearchThatCannotBeFoundAndTriggerRefresh() {
		const fnEnterTextAndFireRefreshButtonPressedOnSearchField = (element: UI5Element) => {
			const oSearchField = element as SearchField
			// set the search field value directly as EnterText action triggers a search event
			oSearchField.setValue(this.sSomethingThatCannotBeFound);

			// fire the search to simulate a refresh button press
			oSearchField.fireSearch({ refreshButtonPressed: true });
		};
		return this.iSearchForValueWithActions(fnEnterTextAndFireRefreshButtonPressedOnSearchField);
	}

	__iClearTheSearch() {
		return this.iSearchForValueWithActions([new EnterText({ text: "" }), new Press()]);
	}

	iSearchForSomethingWithNoResults() {
		return this.iSearchForValueWithActions([new EnterText({ text: this.sSomethingThatCannotBeFound }), new Press()]);
	}

	// assertions
	iShouldSeeTheTable() {
		return this.waitFor({
			id: this.sTableId,
			viewName: this.sViewName,
			success: function (oTable: UI5Element) {
				Opa5.assert.ok(oTable, "Found the object Table");
			},
			errorMessage: "Can't see the master Table."
		});
	}

	theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle() {
		this.waitFor({
			id: new RegExp(`^(${this.sTableId}|${this.sSearchFieldId})$`), // [this.sTableId, this.sSearchFieldId],
			viewName: this.sViewName,
			check: this.allItemsInTheListContainTheSearchTerm.bind(this),
			success: function () {
				Opa5.assert.ok(true, "Every item did contain the title");
			},
			errorMessage: "The table did not have items"
		});
	}

	theTableHasEntries() {
		return this.waitFor({
			viewName: this.sViewName,
			id: this.sTableId,
			matchers: new AggregationFilled({
				name: "items"
			}),
			success: function () {
				Opa5.assert.ok(true, "The table has entries");
			},
			errorMessage: "The table had no entries"
		});
	}

	theTableShouldHaveAllEntries() {
		let aAllEntities: EntitySet[]
		let iExpectedNumberOfItems: number;

		// retrieve all Objects to be able to check for the total amount
		this.waitFor(this.createAWaitForAnEntitySet({
			entitySet: "Products",
			success: function (aEntityData) {
				aAllEntities = aEntityData as EntitySet[];
			}
		}));

		return this.waitFor({
			id: this.sTableId,
			viewName: this.sViewName,
			matchers: function (element: UI5Element) {
				const oTable = element as Table

				// If there are less items in the list than the growingThreshold, only check for this number.
				iExpectedNumberOfItems = Math.min(oTable.getGrowingThreshold(), aAllEntities.length);
				return new AggregationLengthEquals({ name: "items", length: iExpectedNumberOfItems }).isMatching(oTable);
			},
			success: function (element: UI5Element) {
				const oTable = element as Table
				Opa5.assert.strictEqual(oTable.getItems().length, iExpectedNumberOfItems, "The growing Table has " + iExpectedNumberOfItems + " items");
			},
			errorMessage: "Table does not have all entries."
		});
	}

	theTitleShouldDisplayTheTotalAmountOfItems() {
		return this.waitFor({
			id: this.sTableId,
			viewName: this.sViewName,
			matchers: new AggregationFilled({ name: "items" }),
			success: (element: UI5Element) => {
				const oTable = element as Table
				const iObjectCount = (oTable.getBinding("items") as ListBinding).getLength();
				this.waitFor({
					id: "tableHeader",
					viewName: this.sViewName,
					matchers: function (elem: UI5Element) {
						const oPage = elem as Page
						const oResourceModel = oPage.getModel("i18n") as ResourceModel
						const oResourceBundle = oResourceModel.getResourceBundle() as ResourceBundle

						const sExpectedText = oResourceBundle.getText("worklistTableTitleCount", [iObjectCount]);
						return new PropertyStrictEquals({ name: "text", value: sExpectedText }).isMatching(oPage);
					},
					success: function () {
						Opa5.assert.ok(true, "The Page has a title containing the number " + iObjectCount);
					},
					errorMessage: "The Page's header does not container the number of items " + iObjectCount
				});
			},
			errorMessage: "The table has no items."
		});
	}

	theTableShouldContainOnlyFormattedUnitNumbers() {
		return this.theUnitNumbersShouldHaveTwoDecimals("sap.m.ObjectNumber",
			this.sViewName,
			"Object numbers are properly formatted",
			"Table has no entries which can be checked for their formatting");
	}

	iShouldSeeTheNoDataTextForNoSearchResults() {
		return this.waitFor({
			id: this.sTableId,
			viewName: this.sViewName,
			success: function (element: UI5Element) {
				const oTable = element as Table
				Opa5.assert.strictEqual(
					oTable.getNoDataText(),
					oTable.getModel("i18n").getProperty("worklistNoDataWithSearchText"),
					"the table should show the no data text for search");
			},
			errorMessage: "table does not show the no data text for search"
		});
	}

	__theTableShouldHaveTheDoubleAmountOfInitialEntries() {
		let iExpectedNumberOfItems: number;

		return this.waitFor({
			id: this.sTableId,
			viewName: this.sViewName,
			matchers: function (element: UI5Element) {
				const oTable = element as Table
				iExpectedNumberOfItems = oTable.getGrowingThreshold() * 2;
				return new AggregationLengthEquals({ name: "items", length: iExpectedNumberOfItems }).isMatching(oTable);
			},
			success: function () {
				Opa5.assert.ok(true, "The growing Table had the double amount: " + iExpectedNumberOfItems + " of entries");
			},
			errorMessage: "Table does not have the double amount of entries."
		});
	}
}