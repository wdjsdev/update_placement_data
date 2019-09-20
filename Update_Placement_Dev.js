function updatePlacementData(task)
{
	var valid = true;
	// //Production Utilities
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.jsxbin\"");
	eval("#include \"/Volumes/Customization/Library/Scripts/Script Resources/Data/Batch_Framework.jsxbin\"");
	
	//Dev Utilities
	// eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Utilities_Container.js\"");
	// eval("#include \"/Volumes/Macintosh HD/Users/will.dowling/Desktop/automation/utilities/Batch_Framework.js\"");
	
	//production paths
	var btPath = "/Volumes/Customization/Library/Scripts/Script Resources/Data/build_template_library.js";
	var aaPath = "/Volumes/Customization/Library/Scripts/Script Resources/Data/central_library.js";

	function writeDatabaseFile(str,db)
	{
		var parenPat = /[\(\)]/g;
		var newContents = str + JSON.stringify(db).replace(parenPat,"");
		dbFile.open("w");
		dbFile.write(newContents);
		dbFile.close();
	}

	var docRef = app.activeDocument;
	var layers = docRef.layers;

	var code = getCode(layers[0].name);
	if(!code)
	{
		valid = false;
		errorList.push("Failed to determine the garment code.");
	}

	if(valid)
	{
		code = code.replace("_","-");
		var database, data, str, coords;

		if(task == "aa")
		{
			eval("#include \"" + aaPath + "\"");
			dbFile = File(aaPath);
			database = prepressInfo;
			str = "var prepressInfo = ";
		}
		else if(task == "bt")
		{
			eval("#include \"" + btPath + "\"");
			dbFile = File(btPath);
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
		data.placement = coords;
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
		writeDatabaseFile(str,database);
	}

	if(valid)
	{
		alert("Successfully updated the database.");
	}

	if(errorList.length > 0)
	{
		sendErrors(errorList);
	}

	return valid;
	
}

function getTask()
{
	var w = new Window("dialog");
		var topTxt = w.add("statictext", undefined, "Which database do you want to update?");
		var btnGroup = w.add("group");
			var aa = btnGroup.add("button", undefined, "Add Artwork Placement");
				aa.onClick = function()
				{
					result = "aa";
					w.close();
				}
			var bt = btnGroup.add("button", undefined, "Template Placement");
				bt.onClick = function()
				{
					result = "bt";
					w.close();
				}
			var cancel = btnGroup.add("button", undefined, "Cancel");
				cancel.onClick = function()
				{
					result = undefined;
					w.close();
				}
	w.show();

	if(result)
	{
		updatePlacementData(result);
	}

}
getTask();