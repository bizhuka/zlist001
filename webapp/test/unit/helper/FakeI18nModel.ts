import Model from "sap/ui/model/Model";


type Dictionary = {
	[key: string]: string
}

export default class FakeI18nModel extends Model {
	private mTexts: Dictionary

	public constructor(mTexts: Dictionary) {
		super();
		this.mTexts = mTexts || {};
	}

	public getResourceBundle() {
		return {
			getText: (sTextName: string) => {
				return this.mTexts[sTextName];
			}
		};
	}
}
