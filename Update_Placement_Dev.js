function updatePlacementData()
{
	var valid = true;
	var scriptName = "update_placement";
	// //Production Utilities
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");
	
	//Dev Utilities
	// eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Utilities_Container.js\"");
	// eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Batch_Framework.js\"");
	
	if(!valid)
	{
		return;
	}

	logDest.push(getLogDest());


	function getTask()
	{
		log.h("Beginning execution of getTask()");
		var w = new Window("dialog");
			var topTxt = w.add("statictext", undefined, "Which database do you want to update?");
			var btnGroup = w.add("group");
				var aa = UI.iconButton(btnGroup,imagesPath + "add_artwork_placement.jpg",function()
				{
					log.l("User selected \"Add Artwork\".");
					task = "aa";
					w.close();
				});
				var bt = UI.iconButton(btnGroup,imagesPath + "template_placement.jpg",function()
				{
					log.l("User selected \"Template\".");
					task = "bt";
					w.close();
				})
			var cancelGroup = UI.group(w);
				var cancel = UI.button(cancelGroup,"Cancel",function()
				{
					task = undefined;
					valid = false;
					w.close();
				});
		w.show();

	}




	var docRef = app.activeDocument;
	var layers = docRef.layers;
	var task;

	var code = getCode(layers[0].name);
	if(!code)
	{
		valid = false;
		errorList.push("Failed to determine the garment code.");
	}

	if(valid)
	{

		getTask();
	}

	if(valid)
	{
		code = code.replace("_","-");
		var database, data, str, coords;

		if(task == "aa")
		{
			dbPath = centralLibraryPath;
			eval("#include \"" + dbPath + "\"");
			database = prepressInfo;
			str = "var prepressInfo = ";
		}
		else if(task == "bt")
		{
			dbPath = btLibraryPath;
			eval("#include \"" + dbPath + "\"");
			database = templateInfo;
			str = "var templateInfo = ";
		}
	}


	if(valid)
	{
		//check to make sure there's an entry in the database
		if(database[code])
		{
			data = database[code];
		}
		else
		{
			valid = false;
			errorList.push("The garment code: " + code + " was not found in the database.");
			log.e("The garment code: " + code + " was not found in the database.");
		}
	}

	if(valid)
	{
		var ppLay = getPPLay(layers);
		if(!ppLay)
		{
			errorList.push("Failed to find the prepress layer. Check your layer structure and try again.")
			valid = false;
		}
	}

	if(valid)
	{
		coords = coord(ppLay);
		if(!coords)
		{
			errorList.push("Failed to get the coordinates. ")
		}
	}

	if(valid && coords)
	{
		//update the placement data
		log.l("current database coords: ::" + JSON.stringify(data.placement));
		data.placement = coords;
		log.l("updated database coords: ::" + JSON.stringify(data.placement));
		data.updatedBy = user;
		data.updatedOn = logTime();
		if(task === "bt")
		{
			data.sizes = [];
			for(var size in coords)
			{
				data.sizes.push(size);
			}
		}

		database[code] = data;
		//write database file
		str += JSON.stringify(database);
		writeDatabase(dbPath,str);
	}

	if(valid)
	{
		alert("Successfully updated the database.");
	}

	if(errorList.length > 0)
	{
		sendErrors(errorList);
	}

	printLog();
	return valid;
	
}
updatePlacementData();
