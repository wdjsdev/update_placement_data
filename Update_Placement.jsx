function updatePlacementData(task)
{
	var valid = true;
	#include "/Volumes/Customization/Library/Scripts/Script Resources/Data/Utilities_Container.js";
	
	//production paths
	var btPath = "/Volumes/Customization/Library/Scripts/Script Resources/Data/build_template_library.js";
	var aaPath = "/Volumes/Customization/Library/Scripts/Script Resources/Data/central_library.js";

	function sendErrors(errorList)
	{
		alert(errorList.join("\n"));
	}


	function coord()
	{
		var result = true;
		var coords = {};
		var layer;

		try
		{
			layer = layers[0].layers["Prepress"];
		}
		catch(e)
		{
			errorList.push("Sorry. Looks like the prepress layer is missing. Please make sure the layer structure is correct.");
			result = false;
		}

		if(result)
		{
			for(var a=0;a<layer.layers.length;a++)
			{
				var curSize = layer.layers[a].name;
				coords[curSize] = {};
				for(var b=0;b<layer.layers[a].groupItems.length;b++)
				{
					var thisPiece = layer.layers[a].groupItems[b];
					var pieceName = thisPiece.name;
					coords[curSize][pieceName] = [];
					coords[curSize][pieceName][0] = (Math.floor(thisPiece.left *1000)/1000);
					coords[curSize][pieceName][1] = (Math.floor(thisPiece.top *1000)/1000);
				} 	
			}
		}

		if(result)
		{
			return coords;
		}
		else
		{
			return result;
		}
	}

	function getCode()
	{
		var layName = layers[0].name;
		var pat = /(.*)([-_][\d]{3,}([-_][a-z])?)/i;

		return layName.match(pat)[1];
	}

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
	var errorList = [];

	var code = getCode();
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

	var underscoreCode; 

	if(!code)
	{
		valid = false;
	}
	else
	{
		underscoreCode = code.replace("-","_");
	}

	if(valid)
	{
		//check to make sure there's an entry in the database
		if(database[code])
		{
			data = database[code];
		}
		else if(database[underscoreCode])
		{
			code = underscoreCode;
			data = data[underscoreCode];
		}
		else
		{
			valid = false;
			errorList.push("The garment code: " + code + " was not found in the database.");
		}
	}

	if(valid)
	{
		coords = coord();
	}

	if(valid && coords)
	{
		//update the placement data
		data.placement = coords;
		data.updatedBy = user;
		data.updatedOn = logTime();

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