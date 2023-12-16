import { ValueState } from "sap/ui/core/library";

export default {
	formatValue: (value: string) => {
		return value?.toUpperCase();
	},

	/**
	 * Rounds the number unit value to 2 digits
	 */
	numberUnit: (sValue: string) => {
		if (!sValue) {
			return "";
		}
		return parseFloat(sValue).toFixed(2);
	},

	/**
	 * Defines a value state based on the stock level
	 *
	 * @param {number} iValue the stock level of a product
	 * @returns {string} sValue the state for the stock level
	 */
	quantityState: (iValue: number) => {
		if (iValue === 0) {
			return ValueState.Error;
		} else if (iValue <= 10) {
			return ValueState.Warning;
		} else {
			return ValueState.Success;
		}
	}
};
