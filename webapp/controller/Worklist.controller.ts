import { ListBase$UpdateFinishedEvent } from "sap/m/ListBase";
import BaseController from "./BaseController";
import Table from "sap/m/Table";
import JSONModel from "sap/ui/model/json/JSONModel";
import ListBinding from "sap/ui/model/ListBinding";
import { ListItemBase$PressEvent } from "sap/m/ListItemBase";
import ObjectListItem from "sap/m/ObjectListItem";
import { SearchField$SearchEvent } from "sap/m/SearchField";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { IconTabBar$SelectEvent } from "sap/m/IconTabBar";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import { Product } from "./Object.controller";


/**
 * @namespace zlist001.controller
 */

const FilterKeys = ["inStock", "outOfStock", "shortage", "all"] as const
type FilterKeysType = typeof FilterKeys[number]

type WorklistView = {
	worklistTableTitle: string,
	shareOnJamTitle: string,
	shareSendEmailSubject: string,
	shareSendEmailMessage: string,
	tableNoDataText: string,
	tableBusyDelay: number,
	inStock: number,
	shortage: number,
	outOfStock: number,
	countAll: number
}


export default class Main extends BaseController {
	private _aTableSearchState: string[]
	private _oTable: Table
	private _mFilters: {
		[K in typeof FilterKeys[number]]: Filter[]
	}
	private worklistView: WorklistView

	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */

	/**
	 * Called when the worklist controller is instantiated.
	 */
	public onInit() {
		const oTable = this.byId("table") as Table;
		this._oTable = oTable;

		// Put down worklist table's original value for busy indicator delay,
		// so it can be restored later on. Busy handling on the table is
		// taken care of by the table itself.
		const iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
		// keeps the search state
		this._aTableSearchState = [];

		// Model used to manipulate control states
		this.worklistView = {
			worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
			shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
			shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
			shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
			tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
			tableBusyDelay: 0,
			inStock: 0,
			shortage: 0,
			outOfStock: 0,
			countAll: 0,
		}
		const oViewModel = new JSONModel(this.worklistView, true)
		this.setModel(oViewModel, "worklistView");

		// Create an object of filters
		this._mFilters = {
			"inStock": [new Filter("UnitsInStock", FilterOperator.GT, 10)],
			"outOfStock": [new Filter("UnitsInStock", FilterOperator.LE, 0)],
			"shortage": [new Filter("UnitsInStock", FilterOperator.BT, 1, 10)],
			"all": []
		};

		// Make sure, busy indication is showing immediately so there is no
		// break after the busy indication for loading the view's meta data is
		// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
		oTable.attachEventOnce("updateFinished", function () {
			// Restore original busy indicator delay for worklist's table
			oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
		});
	}

	/* =========================================================== */
	/* event handlers                                              */
	/* =========================================================== */

	/**
	 * Triggered by the table's 'updateFinished' event: after new table
	 * data is available, this handler method updates the table counter.
	 * This should only happen if the update was successful, which is
	 * why this handler is attached to 'updateFinished' and not to the
	 * table's list binding's 'dataReceived' method.
	 * @param {sap.ui.base.Event} oEvent the update finished event
	 */
	public onUpdateFinished(oEvent: ListBase$UpdateFinishedEvent) {
		// update the worklist's object counter after the table update
		const oTable: Table = oEvent.getSource()
		const iTotalItems = oEvent.getParameter("total");
		const oModel = this.getModel() as ODataModel

		// only update the counter if the length is final and
		// the table is not empty
		let sTitle: string
		if (iTotalItems && (oTable.getBinding("items") as ListBinding).isLengthFinal()) {
			sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);

			// Get the count for all the products and set the value to 'countAll' property
			oModel.read("/Products/$count", {
				success: (count: number) => {
					this.worklistView.countAll = count
				}
			});
			// read the count for the unitsInStock filter
			oModel.read("/Products/$count", {
				success: (count: number) => {
					this.worklistView.inStock = count
				},
				filters: this._mFilters.inStock
			});
			// read the count for the outOfStock filter
			oModel.read("/Products/$count", {
				success: (count: number) => {
					this.worklistView.outOfStock = count
				},
				filters: this._mFilters.outOfStock
			});
			// read the count for the shortage filter
			oModel.read("/Products/$count", {
				success: (count: number) => {
					this.worklistView.shortage = count
				},
				filters: this._mFilters.shortage
			});
		} else {
			sTitle = this.getResourceBundle().getText("worklistTableTitle");
		}
		this.worklistView.worklistTableTitle = sTitle
	}

	/**
	 * Event handler when a table item gets pressed
	 * @param {sap.ui.base.Event} oEvent the table selectionChange event
	 */
	public onPress(oEvent: ListItemBase$PressEvent) {
		// The source is the list item that got pressed
		this._showObject(oEvent.getSource());
	}

	/**
	 * Event handler for navigating back.
	 * We navigate back in the browser history
	 */
	public onNavBack() {
		history.go(-1);
	}

	public onSearch(oEvent: SearchField$SearchEvent) {
		if (oEvent.getParameters().refreshButtonPressed) {
			// Search field's 'refresh' button has been pressed.
			// This is visible if you select any master list item.
			// In this case no new search is triggered, we only
			// refresh the list binding.
			this.onRefresh();
		} else {
			const aTableSearchState: Filter[] = [];
			const sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				aTableSearchState.push(new Filter("ProductName", FilterOperator.Contains, sQuery));
			}
			this._applySearch(aTableSearchState);
		}

	}

	/**
	 * Event handler for refresh event. Keeps filter, sort
	 * and group settings and refreshes the list binding.
	 */
	public onRefresh() {
		const oTable = this.byId("table");
		oTable.getBinding("items").refresh();
	}

	/* =========================================================== */
	/* internal methods                                            */
	/* =========================================================== */

	/**
	 * Shows the selected item on the object page
	 * On phones a additional history entry is created
	 * @param {sap.m.ObjectListItem} oItem selected Item
	 */
	private _showObject(oItem: ObjectListItem) {
		this.getRouter().navTo("object", {
			objectId: oItem.getBindingContext().getProperty("ProductID") as string
		});
	}

	/**
	 * Internal helper method to apply both filter and search state together on the list binding
	 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
	 */
	private _applySearch(aTableSearchState: Filter[]) {
		const oTable = this.byId("table") as Table

		(oTable.getBinding("items") as ListBinding).filter(aTableSearchState, "Application");
		// changes the noDataText of the list in case there are no filter results
		if (aTableSearchState.length !== 0) {
			this.worklistView.tableNoDataText = this.getResourceBundle().getText("worklistNoDataWithSearchText");
		}
	}

	/**
	 * Displays an error message dialog. The displayed dialog is content density aware.
	 * @param {string} sMsg The error message to be displayed
	 */
	private _showErrorMessage(sMsg: string) {
		MessageBox.error(sMsg, {
			styleClass: this.getOwnerComponent().getContentDensityClass()
		});
	}

	/**
	 * Event handler when a filter tab gets pressed
	 * @param {sap.ui.base.Event} oEvent the filter tab event
	 */
	public onQuickFilter(oEvent: IconTabBar$SelectEvent) {
		const oBinding = this._oTable.getBinding("items") as ListBinding;
		const sKey = oEvent.getParameter("selectedKey") as FilterKeysType;
		oBinding.filter(this._mFilters[sKey]);
	}

	/**
	 * Error and success handler for the unlist action.
	 * @param {string} sProductId the product ID for which this handler is called
	 * @param {boolean} bSuccess true in case of a success handler, else false (for error handler)
	 * @param {number} iRequestNumber the counter which specifies the position of this request
	 * @param {number} iTotalRequests the number of all requests sent
	 */
	private _handleUnlistActionResult(sProductId: string, bSuccess: boolean, iRequestNumber: number, iTotalRequests: number) {
		// we could create a counter for successful and one for failed requests
		// however, we just assume that every single request was successful and display a success message once
		if (iRequestNumber === iTotalRequests) {
			MessageToast.show(this.getResourceBundle().getText("StockRemovedSuccessMsg", [iTotalRequests]));
		}
	}

	/**
	 * Error and success handler for the reorder action.
	 * @param {string} sProductId the product ID for which this handler is called
	 * @param {boolean} bSuccess true in case of a success handler, else false (for error handler)
	 * @param {number} iRequestNumber the counter which specifies the position of this request
	 * @param {number} iTotalRequests the number of all requests sent
	 */
	private _handleReorderActionResult(sProductId: string, bSuccess: boolean, iRequestNumber: number, iTotalRequests: number) {
		// we could create a counter for successful and one for failed requests
		// however, we just assume that every single request was successful and display a success message once
		if (iRequestNumber === iTotalRequests) {
			MessageToast.show(this.getResourceBundle().getText("StockUpdatedSuccessMsg", [iTotalRequests]));
		}
	}

	/**
	 * Event handler for the unlist button. Will delete the
	 * product from the (local) model.
	 */
	public onUnlistObjects() {
		const aSelectedProducts = this._oTable.getSelectedItems();
		if (aSelectedProducts.length) {
			for (let i = 0; i < aSelectedProducts.length; i++) {
				const oProduct = aSelectedProducts[i];
				const oProductId = oProduct.getBindingContext().getProperty("ProductID") as string;
				const sPath = oProduct.getBindingContext().getPath();
				(this.getModel() as ODataModel).remove(sPath, {
					success: this._handleUnlistActionResult.bind(this, oProductId, true, i + 1, aSelectedProducts.length),
					error: this._handleUnlistActionResult.bind(this, oProductId, false, i + 1, aSelectedProducts.length)
				});
			}
		} else {
			this._showErrorMessage(this.getResourceBundle().getText("TableSelectProduct"));
		}
	}

	/**
	 * Event handler for the reorder button. Will reorder the
	 * product by updating the (local) model
	 */
	public onUpdateStockObjects() {
		const aSelectedProducts = this._oTable.getSelectedItems();
		if (aSelectedProducts.length) {
			for (let i = 0; i < aSelectedProducts.length; i++) {
				const sPath = aSelectedProducts[i].getBindingContext().getPath();
				const oProductObject = aSelectedProducts[i].getBindingContext().getObject() as Product;
				oProductObject.UnitsInStock += 10;
				(this.getModel() as ODataModel).update(sPath, oProductObject, {
					success: this._handleReorderActionResult.bind(this, oProductObject.ProductID, true, i + 1, aSelectedProducts.length),
					error: this._handleReorderActionResult.bind(this, oProductObject.ProductID, false, i + 1, aSelectedProducts.length)
				});
			}
		} else {
			this._showErrorMessage(this.getResourceBundle().getText("TableSelectProduct"));
		}
	}
}
