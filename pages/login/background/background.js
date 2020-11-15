
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.action && request.action === 'inject') {
		chrome.tabs.executeScript(null, {
		    code: 'var request = ' + JSON.stringify(request)
		}, function() {
			chrome.tabs.executeScript(null, { file: "libs/jquery.js" }, function() {
		    	chrome.tabs.executeScript(null, { file : 'browser/browser-inject.js' });
		    });
		});
	} else if(request.action && request.action === 'copyToFile') {
		var a = document.createElement("a");
	    var file = new Blob([request.content], { type: 'text/plain' });
	    a.href = URL.createObjectURL(file);
	    a.download = 'sbpSLA exported configuration.json';
	    a.click();
	} else if(request.action && request.action === 'copyToClipboard') {
		var copyFrom = document.createElement("textarea");
		copyFrom.textContent = request.content;
		document.body.appendChild(copyFrom);
		copyFrom.focus();
		copyFrom.select();
		document.execCommand('Copy');
		document.body.removeChild(copyFrom);
	}

	return true;
});

chrome.commands.onCommand.addListener(function(command) {
        console.log('Command:', command);
      });
