import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import Targets from "sap/m/routing/Targets";
import Filter from "sap/ui/model/Filter";
import ListBinding from "sap/ui/model/ListBinding";
import FilterOperator from "sap/ui/model/FilterOperator";
import { FeedInput$PostEvent } from "sap/m/FeedInput";
import DateFormat from "sap/ui/core/format/DateFormat";
import UI5Date from "sap/ui/core/date/UI5Date";
import { CommentItem, CommentsModel } from "zlist001/model/models";

/**
 * @namespace zlist001.controller
*/

export type Product = {
	ProductID: string;
	ProductName: string;
	UnitsInStock: number
}

type ObjProduct = {
	objectId: string
}

export default class Object extends BaseController {

	/* =========================================================== */
	/* lifecycle methods                                           */
	/* =========================================================== */

	/**
	 * Called when the worklist controller is instantiated.
	 */
	public onInit() {
		// Model used to manipulate control states. The chosen values make sure,
		// detail page is busy indication immediately so there is no break in
		// between the busy indication for loading the view's meta data
		const oViewModel = new JSONModel({
			busy: true,
			delay: 0
		});

		this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched.bind(this));

		// Store original busy indicator delay, so it can be restored later on
		const iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
		this.setModel(oViewModel, "objectView");
		void (this.getOwnerComponent().getModel() as ODataModel).metadataLoaded().then(() => {
			// Restore original busy indicator delay for the object view
			oViewModel.setProperty("/delay", iOriginalBusyDelay);
		});
	}

	/* =========================================================== */
	/* event handlers                                              */
	/* =========================================================== */

	/**
	  * Updates the model with the user comments on Products.
	  * @function
	  * @param {sap.ui.base.Event} oEvent object of the user input
	  */
	public onPost(oEvent: FeedInput$PostEvent) {
		const oFormat = DateFormat.getDateTimeInstance({ style: "medium" });
		const sDate = oFormat.format(UI5Date.getInstance());
		const oObject = this.getView().getBindingContext().getObject() as Product;
		const sValue = oEvent.getParameter("value");
		const oEntry = {
			productID: oObject.ProductID,
			type: "Comment",
			date: sDate,
			comment: sValue
		} as CommentItem;
		// update model
		const oFeedbackModel = this.getModel("productFeedback") as JSONModel;
		const dataModel = oFeedbackModel.getData() as CommentsModel;
		dataModel.productComments.push(oEntry);
		oFeedbackModel.setData(dataModel);
	}


	/**
	 * Event handler  for navigating back.
	 * It there is a history entry we go one step back in the browser history
	 * If not, it will replace the current entry of the browser history with the worklist route.
	 */
	public onNavBack() {
		super.onNavBack()
	}

	/* =========================================================== */
	/* internal methods                                            */
	/* =========================================================== */

	/**
	 * Binds the view to the object path.
	 * @function
	 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
	 */
	private _onObjectMatched(oEvent: Route$MatchedEvent) {
		const sObjectId = (oEvent.getParameter("arguments") as ObjProduct).objectId;
		void (this.getModel() as ODataModel).metadataLoaded().then(() => {
			const sObjectPath = (this.getModel() as ODataModel).createKey("Products", {
				ProductID: sObjectId
			} as Product);
			this._bindView("/" + sObjectPath);
		});
	}

	/**
	 * Binds the view to the object path.
	 * @function
	 * @param {string} sObjectPath path to the object to be bound
	 */
	private _bindView(sObjectPath: string) {
		const oViewModel = this.getModel("objectView") as JSONModel
		const oDataModel = this.getModel() as ODataModel;

		this.getView().bindElement({
			path: sObjectPath,
			events: {
				change: this._onBindingChange.bind(this),

				dataRequested: () => {
					void oDataModel.metadataLoaded().then(() => {
						// Busy indicator on view should only be set if metadata is loaded,
						// otherwise there may be two busy indications next to each other on the
						// screen. This happens because route matched handler already calls '_bindView'
						// while metadata is loaded.
						oViewModel.setProperty("/busy", true);
					});
				},

				dataReceived: () => {
					oViewModel.setProperty("/busy", false);
				}
			}
		});
	}

	private _onBindingChange() {
		const oView = this.getView()
		const oViewModel = this.getModel("objectView") as JSONModel
		const oElementBinding = oView.getElementBinding();

		// No data for the binding
		if (!oElementBinding.getBoundContext()) {
			void (this.getRouter().getTargets() as Targets).display("objectNotFound");
			return;
		}

		const oResourceBundle = this.getResourceBundle()
		const oObject = oView.getBindingContext().getObject() as Product
		const sObjectId = oObject.ProductID
		const sObjectName = oObject.ProductName;

		oViewModel.setProperty("/busy", false);
		oViewModel.setProperty("/shareSendEmailSubject",
			oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
		oViewModel.setProperty("/shareSendEmailMessage",
			oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));

		// Update the comments in the list
		const oList = this.byId("idCommentsList");
		const oBinding = oList.getBinding("items") as ListBinding;
		oBinding.filter(new Filter("productID", FilterOperator.EQ, sObjectId));
	}

}