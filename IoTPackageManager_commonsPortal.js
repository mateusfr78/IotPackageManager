/*
 * IoT Package Manager - Common/Shared JS functions and variables.
 * Used in "CommonsPortal" portal
 * Last Update: 2017-11-06
 *
 */


//Calls searchPackages service and navigates to search results page...
/*
window.searchPackages = function(searchStr){
    console.log('Executing searchPackages for: '+ searchStr);
    datasources.searchPackages.sendData({
        "searchTerm": searchStr
    }).then(function(data){
        console.log("success: " + JSON.stringify(data));
        CB_PORTAL.selectPage('/SearchResults');
    }, function(error){
        console.log("error: "+ JSON.stringify(error));
    });
};
*/
window.searchPackages = function(searchStr, requestedPage, isNewSearch){
    console.log('Executing searchPackages()... ');
    console.log('searchStr: '+ searchStr);
    console.log('requestedPage: '+ requestedPage);
    console.log('isNewSearch: '+ isNewSearch);
    
    if (document.getElementById('searchPageTitle')) {
    	document.getElementById('searchPageTitle').innerHTML = '<p><span class="font-italic" style="color:gray;">Loading IoT packages...</span></p>';
    }
    if (document.getElementById('searchResults')) {
    	document.getElementById('searchResults').innerHTML = '<h2 style="text-align: center; color: gray;">Loading...</h2>';
    }
    
    /* 
     * Try to use the params of the function. If not available then try to get 
     * from the SessionDataObj.
     */
    var theSearchTerm;
    var theRequestedPage;
    var theSortingCriteria;
    var theAssetTypesFilter = [];
    
    //Resets "searchCriteria" if new search...
    if (isNewSearch) {
    	resetSortingAndFilters();
    	if (datasources.SessionDataObj) {
    		console.log("Resetting 'searchCriteria' in 'SessionDataObj'...");
    		datasources.SessionDataObj.searchCriteria = {};
    	}
    }
    
    //Search Term...
    if (searchStr) {
    	theSearchTerm = searchStr;
    } 
    else {
    	if (datasources.SessionDataObj && 
    		datasources.SessionDataObj.searchCriteria && 
    		datasources.SessionDataObj.searchCriteria.searchTerm) {
    		
    		theSearchTerm = datasources.SessionDataObj.searchCriteria.searchTerm;
    	}
    }
    
    //Requested Page...
    if (requestedPage) {
    	theRequestedPage = requestedPage;
    } 
    else {
    	if (datasources.SessionDataObj && 
    		datasources.SessionDataObj.searchCriteria && 
    		datasources.SessionDataObj.searchCriteria.requestedPage) {
    		
    		theRequestedPage = datasources.SessionDataObj.searchCriteria.requestedPage;
    	}
    }
    
    //Sorting order...
    if (document.getElementById('searchNewestRadio') && 
    	document.getElementById('searchNewestRadio').checked) {
    	
    	theSortingCriteria = "newest";
    }
    else {
    	theSortingCriteria = "popular";
    }
    //If user changed sorting criteria then reset requested page to 1...
    if (datasources.SessionDataObj && 
    	datasources.SessionDataObj.searchCriteria && 
    	datasources.SessionDataObj.searchCriteria.sortingType && 
    	datasources.SessionDataObj.searchCriteria.sortingType !== theSortingCriteria) {
    		
    	console.log("Reseting requested page to '1' due to change in sorting criteria...");	
    	theRequestedPage = 1;
    }
    
    //Asset Filters...
    if (document.getElementById('SearchResults_Asset_Filters')) {
    	var assetTypeJson;
    	var checkboxList = document.getElementsByName('SearchResults_AssetFilter');
    	for (var i=0; i < checkboxList.length; i++) {
    		if (checkboxList[i].checked) {
    			assetTypeJson = {"name": checkboxList[i].value};
    			theAssetTypesFilter.push(assetTypeJson);
    		}
    	}
    }
    
    console.log('theSearchTerm: '+ theSearchTerm);
    console.log('theRequestedPage: '+ theRequestedPage);
    console.log('theSortingCriteria: '+ theSortingCriteria);
    console.log('theAssetTypesFilter: '+ JSON.stringify(theAssetTypesFilter));
    datasources.searchPackages.sendData({
        "searchTerm": theSearchTerm,
        "pageNumber": theRequestedPage,
        "sortingCriteria": theSortingCriteria,
        "assetTypes": theAssetTypesFilter
    });
    
    console.log("Redirecting to SearchResults...");
    CB_PORTAL.selectPage('/SearchResults');
    
};

//Navigate to Package Details page...
window.gotoPackageDetails = function(packageId){
    console.log('gotoPackageDetails with packageId: '+ packageId);
    datasources.getPackageDetails.sendData({
    	"packageId": packageId
    }).then(function(data){
        console.log("Processing promise for getPackageDetails. Success: " + data.success);
        if (data.success && data.results) {
        	datasources.SessionDataObj.sendData({
            	packageDetails: data.results
        	});
        	CB_PORTAL.selectPage('/PackageDetails');
        }
    }, function(error){
        console.log("error: "+ JSON.stringify(error));
    });
};

//Get the name of the css class for the background color of the asset types...
window.getBgColorClass = function(assetType) {
	
	if (assetType === 'Code Libraries') {
		return 'badge-info';
	}
	if (assetType === 'Code Services') {
		return 'badge-success';
	}
	if (assetType === 'Portals') {
		return 'badge-primary';
	}
	if (assetType === 'Collections') {
		return 'badge-warning';
	}
	if (assetType === 'Plugins') {
		return 'badge-danger';
	}
	//Everything else uses the default...
	return 'badge-default';
	
};

//Call service...
window.getPackages = function (page) {
  console.log('Calling getPackages()... requesting page ' + page);
  
  datasources.getMostPopularPackages.sendData({
    pageNumber: page 
  });
};

window.checkSubmit = function(e) {
	//console.log("Running checkSubmit()...");
	//console.log("Search Term: " + document.getElementById('searchInput').value);
    if(e && e.keyCode === 13) {
    	console.log("User pressed ENTER in 'Search' box!");
    	searchPackages(document.getElementById('searchInput').value,1,true);
    }
};

//Reset the sorting order and filters on the Search Results page
window.resetSortingAndFilters = function() {

	//Revert default sorting to "most popular"...
	if (document.getElementById('searchPopularRadio')) {
		document.getElementById('searchPopularRadio').checked = true;
	}
	
	//Clear all filters...
	if (document.getElementById('SearchResults_Asset_Filters')) {
    	var assetTypeJson;
    	var checkboxList = document.getElementsByName('SearchResults_AssetFilter');
    	for (var i=0; i < checkboxList.length; i++) {
    		checkboxList[i].checked = false;
    	}
    }
};

//Read the value of the given parameter from the browser's URL...
window.getUrlParameter = function(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

window.DEFAULT_POST_LOGIN_PAGE = '/Home';

/*
Clean the data in the given keys from SessionDataObj.
@param {keys} An array with the keys in the JSON to be cleaned.
*/
window.cleanDatasourceCache = function(keys) {
	if (datasources && datasources.SessionDataObj && keys) {
	    //console.log("Number of keys: " + keys.length);
		for (var i=0; i < keys.length; i++) {
			if (datasources.SessionDataObj.hasOwnProperty(keys[i])) {
				//console.log("SessionDataObj has key '" + keys[i] + "'. Cleaning it...");
				datasources.SessionDataObj[keys[i]] = {};
			}
		}
	}
};

//Check if the user is authenticated
window.isUserAuthenticated = function() {
	
	if (datasources && datasources.getLoggedInUserInfo) {
		//Call the service...
		datasources.getLoggedInUserInfo.sendData({
		}).then(function(data) {
			if (data.success) {
				console.log("isUserAuthenticated :: user is authenticated");
				return true;
			}
			else {
				console.log("isUserAuthenticated :: user is anonymous");
				return false;
			}
		}, function(error) {
			console.log("isUserAuthenticated :: call to 'getLoggedInUserInfo' service returned error: " + error);
		});
	}
	else {
		return false;
	}
};
