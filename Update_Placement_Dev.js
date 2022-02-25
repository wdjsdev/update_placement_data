#target Illustrator
function updatePlacementData()
{
	var valid = true;
	var scriptName = "update_placement";
	


	function getUtilities()
	{
		var result = [];
		var utilPath = "/Volumes/Customization/Library/Scripts/Script_Resources/Data/";
		var ext = ".jsxbin"

		//check for dev utilities preference file
		var devUtilitiesPreferenceFile = File("~/Documents/script_preferences/dev_utilities.txt");

		if(devUtilitiesPreferenceFile.exists)
		{
			devUtilitiesPreferenceFile.open("r");
			var prefContents = devUtilitiesPreferenceFile.read();
			devUtilitiesPreferenceFile.close();
			if(prefContents.match(/true/i))
			{
				utilPath = "~/Desktop/automation/utilities/";
				ext = ".js";
			}
		}

		if($.os.match("Windows"))
		{
			utilPath = utilPath.replace("/Volumes/","//AD4/");
		}

		result.push(utilPath + "Utilities_Container" + ext);
		result.push(utilPath + "Batch_Framework" + ext);

		if(!result.length)
		{
			valid = false;
			alert("Failed to find the utilities.");
		}
		return result;

	}

	var utilities = getUtilities();
	for(var u=0,len=utilities.length;u<len;u++)
	{
		eval("#include \"" + utilities[u] + "\"");	
	}

	if(!valid)return;


	

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


	app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

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
