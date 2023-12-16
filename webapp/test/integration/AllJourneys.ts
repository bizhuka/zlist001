import Opa5 from "sap/ui/test/Opa5";
import Startup from "./arrangements/Startup";
import WorklistJourney from "./WorklistJourney";
import NavigationJourney from "./NavigationJourney";
import NotFoundJourney from "./NotFoundJourney";
import ObjectJourney from "./ObjectJourney";



Opa5.extendConfig({
	arrangements: new Startup(),
	viewNamespace: "zlist001.view.",
	autoWait: true
});

export {

}


WorklistJourney.testAll()
NavigationJourney.testAll()
NotFoundJourney.testAll()
ObjectJourney.testAll()