/**
 *
 */
var sbpSLA = (function() {

	var _slaData = null;

	function synchronize(callback) {
		chrome.storage.sync.set(_slaData, function() {
			// Check if there was an error
			if(chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError.message);
	       		callback(chrome.runtime.lastError.message);
	   		} else {
	   			callback(null);
	   		}
		});
	}

	function getStoredData(callback) {
		if(_slaData) {
			console.log('Returning from cache');
			callback(_slaData);
		} else {
			getDataFromChromeStorage(function(err, storedValue) {
				if(err) {
					console.log('Error: ' + err);
				}
				callback(_slaData);
			});
		}
	}

	function getDataFromChromeStorage(callback) {
		chrome.storage.sync.get('sbp-sla', function (storedValue) {
			// Check if there was an error
			if(chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError.message);
	       		callback(chrome.runtime.lastError.message);
	   		}

			// We check if the objet returned has our own specific signature
			if(storedValue && storedValue['sbp-sla']) {
				_slaData = storedValue;
			} else {
				_slaData = {
					'sbp-sla' : {
						environments : [],
						users : [],
						slaConfiguration : { }
					}
				};
			}
			callback(null, _slaData);
		});
	}

	function deleteConfig(callback) {
		_slaData = {
			'sbp-sla' : {
				environments : [],
				users : [],
				slaConfiguration : { }
			}
		};
		synchronize(function(err) {
			if(err) {
				callback(err);
			} else {
				callback(null);
			}
		});
	}

	return {
		synchronize : synchronize,
		getStoredData : getStoredData,
		deleteConfig : deleteConfig 
	}

})();

/**
 *
 */
var slaUtils = (function(sbpSLA) {

	function getAllData(callback) {
		sbpSLA.getStoredData(function(storedData) {
			callback(storedData);
		});
	}

	function getEnvironments(callback) {
		var auxEnvs = [];
		sbpSLA.getStoredData(function(envs) {
			if(envs && envs['sbp-sla']) {
				_.each(envs['sbp-sla'].environments, function(env) {
					auxEnvs.push(env);
				});
			}
			callback(auxEnvs);
		});
	}

	function getUsersByEnvironment(keyEnv, callback) {
		sbpSLA.getStoredData(function(userCredentials) {
			if(userCredentials && userCredentials['sbp-sla']) {
				var users = _.filter(userCredentials['sbp-sla'].users, { 'envId' : keyEnv });
				callback((users) ? users : null);
			}
		});
	}

	function getWholeInfoFromUser(keyEnv, username, callback) {
		sbpSLA.getStoredData(function(userCredentials) {
			if(userCredentials && userCredentials['sbp-sla']) {
				var users = _.filter(userCredentials['sbp-sla'].users, { 'envId' : keyEnv, 'username' : username });
				callback((users) ? users : null);
			}
		});
	}

	function addNewEnvironment(newEnvName, callback) {
		sbpSLA.getStoredData(function(data) {
			data['sbp-sla'].environments.push({ 
				envId : _.size(data['sbp-sla'].environments) + 1, 
				envName : newEnvName 
			});
			sbpSLA.synchronize(function(err) {
				callback((err) ? err : null);
			});
		});
	}

	function modifyEnvironment(keyEnv, newEnvName, callback) {
		sbpSLA.getStoredData(function(data) {
			_.find(data['sbp-sla'].environments, function(environment, envIndex) { 
				if(environment.envId === Number(keyEnv)) {
					data['sbp-sla'].environments[envIndex].envName = newEnvName;  // Update
					return true;
				}
			});

			// Sync & commit data
			sbpSLA.synchronize(function(err) {
				callback((err) ? err : null);
			});
		});
	}

	function deleteEnvironment(keyEnv, callback) {
		sbpSLA.getStoredData(function(data) {
			_.find(data['sbp-sla'].environments, function(environment, envIndex) { 
   				if(environment.envId === Number(keyEnv)) { 
   					// Delete the environment entry
   					data['sbp-sla'].environments.splice(envIndex, 1);

   					// Delete the users entries related
   					_.find(data['sbp-sla'].users, function(userEntry, userIndex) {
   						if(userEntry.envId === Number(keyEnv)) {
   							data['sbp-sla'].users.splice(userIndex, 1);
   							return true;
   						}
   					});

   					// Sync & commit data
   					sbpSLA.synchronize(function(err) {
   						callback((err) ? err : null);
   					});
   					return true;
   				}; 
			});
		});
	}

	function addNewUserCredentials(user, pass, userSelector, passSelector, description, envId, callback) {
		sbpSLA.getStoredData(function(data) {
			data['sbp-sla'].users.push({
				envId : envId,
				username : user,
				password : pass,
				userSelector : userSelector,
				passSelector : passSelector,
				description : description
			});
			sbpSLA.synchronize(function(err) {
				callback((err) ? err : null);
			});
		});
	}

	function modifyUserCredentials(username, password, userSelector, passSelector, description, envId, olderUsername, callback) {
		sbpSLA.getStoredData(function(data) {
			if(data && data['sbp-sla']) {
				_.find(data['sbp-sla'].users, function(user, userIndex) { 
					if(user.envId === Number(envId) && user.username === olderUsername) {
						data['sbp-sla'].users[userIndex] = {
							envId : envId,
							username : username,
							password : password,
							userSelector : userSelector,
							passSelector : passSelector,
							description : description
						};
						return true;
					}
				});
				sbpSLA.synchronize(function(err) {
					callback((err) ? err : null);
				});
			}			
		});
	}

	function deleteUserCredentials(envId, username, callback) {
		sbpSLA.getStoredData(function(data) {
			if(data && data['sbp-sla']) {
				_.find(data['sbp-sla'].users, function(user, userIndex) { 
					if(user.envId === Number(envId) && user.username === username) {
						data['sbp-sla'].users.splice(userIndex, 1);
						return true;
					}
				});
				sbpSLA.synchronize(function(err) {
					callback((err) ? err : null);
				});
			}			
		});
	}

	function deleteConfiguration(callback) {
		sbpSLA.deleteConfig(function(err) { 
			callback(err);
		});
	}

	return {
		getAllData : getAllData,
		getEnvironments : getEnvironments,
		getUsersByEnvironment : getUsersByEnvironment,
		getWholeInfoFromUser : getWholeInfoFromUser,
		addNewEnvironment : addNewEnvironment,
		modifyEnvironment : modifyEnvironment,
		deleteEnvironment : deleteEnvironment,
		addNewUserCredentials : addNewUserCredentials,
		modifyUserCredentials : modifyUserCredentials,
		deleteUserCredentials : deleteUserCredentials,
		deleteConfiguration : deleteConfiguration
	}

})(sbpSLA);