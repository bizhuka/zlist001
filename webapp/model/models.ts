import JSONModel from "sap/ui/model/json/JSONModel";
import BindingMode from "sap/ui/model/BindingMode";

import Device from "sap/ui/Device";

export type CommentItem = {
	productID: string,
	type: string,
	date: string,
	comment: string
}
export type CommentsModel = {
	productComments: CommentItem[]
}

export default {
	createDeviceModel: () => {
		const oModel = new JSONModel(Device);
		oModel.setDefaultBindingMode(BindingMode.OneWay);
		return oModel;
	},

	createCommentsModel: () => {
		return new JSONModel({ productComments: [] } as CommentsModel);
	}
};
