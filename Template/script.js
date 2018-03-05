/*******************
VARIABLES
*******************/
var creativeId = "DeluxeBanner";
var creativeVersion = "2.0.0";
var lastModified = "2017-11-01";
var lastUploaded = "2017-11-01";
var templateVersion = "2.0.24";
var templateName = "cf_deluxe_banner_basic_1x1_" + creativeVersion + "_6266"; // cf_[format_name]_[template_name]_[wxh]_version_BlockID
var dimensions;
var scrollPos = {
	x: 0,
	y: 0
};

var bannerDiv;
var adId, rnd, uid;

function checkIfAdKitReady(event) {
	if (window.adkit) {
		adkit.onReady(initializeCreative);
	}
	else {
		initializeCreative();
	}
}

function initializeCreative(event) {

	var rnd = Math.floor(Math.random()*900000) + 100000;
	var img = new Image();
	img.src = 'https://bs.serving-sys.com/Serving/adServer.bs?cn=display&c=19&pli=1074223817&adid=1074808954&ord=' + rnd;

	try { //try/catch just in case localPreview.js is not included
		if (window.localPreview) {
			window.initializeLocalPreview(); //in localPreview.js
		}
	}
	catch (e) {}

	// so messaging can work in safe frames we need to bind the events that are present in the event manager.
	EBG.pm.bind("sendCreativeId", function() {
		eventManager.apply(this, arguments);
	}, this);
	EBG.pm.bind("eventCallback", function() {
		eventManager.apply(this, arguments);
	}, this);

	//Workaround (from QB6573) for Async EB Load where Modernizr isn't properly initialized
	typeof Modernizr == "object" && (Modernizr.touch = Modernizr.touch || "ontouchstart" in window);

	initializeGlobalVariables();
	window.registerInteraction = function() {}; //overwrite rI function because it will never actually be called
	addEventListeners();
	setCreativeVersion();
}

function initializeGlobalVariables() {
	adId = EB._adConfig.adId;
	rnd = EB._adConfig.rnd;
	uid = EB._adConfig.uid;
	bannerDiv = document.getElementById("banner");
}

function addEventListeners() {
	document.getElementById("clickBtn").addEventListener("click", handleClickthroughButtonClick);
}

function handleClickthroughButtonClick(event) {
	EB.clickthrough();
}

function setCreativeVersion() {
	sendMessage("setCreativeVersion", {
		creativeId: creativeId + " - " + templateName,
		creativeVersion: creativeVersion,
		creativeLastModified: lastModified,
		uid: uid
	});
}

/*********************************
HTML5 Event System - Do Not Modify
*********************************/
var listenerQueue;
var creativeIFrameId;

function sendMessage(type, data) {

	//note: the message type we're sending is also the name of the function inside
	//		the custom script's messageHandlers object, so the case must match.

	if (!data.type) data.type = type;
	EB._sendMessage(type, data);
}

function addCustomScriptEventListener(eventName, callback, interAd) {
	listenerQueue = listenerQueue || {};
	var data = {
		uid: uid,
		listenerId: Math.ceil(Math.random() * 1000000000),
		eventName: eventName,
		interAd: !!(interAd),
		creativeIFrameId: creativeIFrameId
	};
	sendMessage("addCustomScriptEventListener", data);
	data.callback = callback;
	listenerQueue[data.listenerId] = data;
	return data.listenerId;
}

function dispatchCustomScriptEvent(eventName, params) {
	params = params || {};
	params.uid = uid;
	params.eventName = eventName;
	params.creativeIFrameId = creativeIFrameId;
	sendMessage("dispatchCustomScriptEvent", params);
}

function removeCustomScriptEventListener(listenerId) {
	var params = {
		uid: uid,
		listenerId: listenerId,
		creativeIFrameId: creativeIFrameId
	};

	sendMessage("removeCustomScriptEventListener", params);
	if (listenerQueue[listenerId])
		delete listenerQueue[listenerId];
}

function eventManager(event) {

	var msg;
	if (typeof event == "object" && event.data) {
		msg = JSON.parse(event.data);

	}
	else {
		// this is safe frame.
		msg = {
			type: event.type,
			data: event
		};
	}
	if (msg.type && msg.data && (!uid || (msg.data.uid && msg.data.uid == uid))) {
		switch (msg.type) {
			case "sendCreativeId":
				creativeIFrameId = msg.data.creativeIFrameId;
				addCustomScriptEventListener('pageScroll', onPageScroll);
				sendMessage("dispatchScrollPos", {
					uid: uid
				});
				if (creativeContainerReady)
					creativeContainerReady();
				break;
			case "eventCallback": // Handle Callback
				var list = msg.data.listenerIds;
				var length = list.length;
				for (var i = 0; i < length; i++) {
					try {
						var t = listenerQueue[list[i]];
						if (!t) continue;
						t.callback(msg.data);
					}
					catch (e) {}
				}
				break;
		}
	}
}

window.addEventListener("message", function() {
	try {
		eventManager.apply(this, arguments);
	}
	catch (e) {}
}, false);

/*************************************
End HTML5 Event System - Do Not Modify
*************************************/

window.addEventListener("load", checkIfAdKitReady);