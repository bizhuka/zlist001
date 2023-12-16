// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

// import all your OPA journeys here
void Promise.all([import("integration/AllJourneys")]).then(() => {
	QUnit.start();
});
