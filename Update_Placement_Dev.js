#target Illustrator
function updatePlacementData ()
{
	var valid = true;
	var scriptName = "update_placement";



	function getUtilities ()
	{
		var utilNames = [ "Utilities_Container" ]; //array of util names
		var utilFiles = []; //array of util files
		//check for dev mode
		var devUtilitiesPreferenceFile = File( "~/Documents/script_preferences/dev_utilities.txt" );
		function readDevPref ( dp ) { dp.open( "r" ); var contents = dp.read() || ""; dp.close(); return contents; }
		if ( devUtilitiesPreferenceFile.exists && readDevPref( devUtilitiesPreferenceFile ).match( /true/i ) )
		{
			$.writeln( "///////\n////////\nUsing dev utilities\n///////\n////////" );
			var devUtilPath = "~/Desktop/automation/utilities/";
			utilFiles = [ devUtilPath + "Utilities_Container.js", devUtilPath + "Batch_Framework.js" ];
			return utilFiles;
		}

		var dataResourcePath = customizationPath + "Library/Scripts/Script_Resources/Data/";

		for ( var u = 0; u < utilNames.length; u++ )
		{
			var utilFile = new File( dataResourcePath + utilNames[ u ] + ".jsxbin" );
			if ( utilFile.exists )
			{
				utilFiles.push( utilFile );
			}

		}

		if ( !utilFiles.length )
		{
			alert( "Could not find utilities. Please ensure you're connected to the appropriate Customization drive." );
			return [];
		}


		return utilFiles;

	}
	var utilities = getUtilities();

	for ( var u = 0, len = utilities.length; u < len && valid; u++ )
	{
		eval( "#include \"" + utilities[ u ] + "\"" );
	}

	if ( !valid || !utilities.length ) return;




	logDest.push( getLogDest() );


	function getTask ()
	{
		log.h( "Beginning execution of getTask()" );
		var w = new Window( "dialog" );
		var topTxt = w.add( "statictext", undefined, "Which database do you want to update?" );
		var btnGroup = w.add( "group" );
		var aa = UI.iconButton( btnGroup, imagesPath + "add_artwork_placement.jpg", function ()
		{
			log.l( "User selected \"Add Artwork\"." );
			task = "aa";
			w.close();
		} );
		var bt = UI.iconButton( btnGroup, imagesPath + "template_placement.jpg", function ()
		{
			log.l( "User selected \"Template\"." );
			task = "bt";
			w.close();
		} )
		var cancelGroup = UI.group( w );
		var cancel = UI.button( cancelGroup, "Cancel", function ()
		{
			task = undefined;
			valid = false;
			w.close();
		} );
		w.show();

	}




	var docRef = app.activeDocument;
	var layers = docRef.layers;
	var task;


	app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

	var code = getCode( layers[ 0 ].name );
	if ( !code )
	{
		valid = false;
		errorList.push( "Failed to determine the garment code." );
	}

	if ( valid )
	{

		getTask();
	}

	if ( valid )
	{
		code = code.replace( "_", "-" );
		var database, data, str, coords;

		if ( task == "aa" )
		{
			dbPath = centralLibraryPath;
			eval( "#include \"" + dbPath + "\"" );
			database = prepressInfo;
			str = "var prepressInfo = ";
		}
		else if ( task == "bt" )
		{
			dbPath = btLibraryPath;
			eval( "#include \"" + dbPath + "\"" );
			database = templateInfo;
			str = "var templateInfo = ";
		}
	}


	if ( valid )
	{
		//check to make sure there's an entry in the database
		if ( database[ code ] )
		{
			data = database[ code ];
		}
		else
		{
			valid = false;
			errorList.push( "The garment code: " + code + " was not found in the database." );
			log.e( "The garment code: " + code + " was not found in the database." );
		}
	}

	if ( valid )
	{
		var ppLay = getPPLay( layers );
		if ( !ppLay )
		{
			errorList.push( "Failed to find the prepress layer. Check your layer structure and try again." )
			valid = false;
		}
	}

	if ( valid )
	{
		coords = coord( ppLay );
		if ( !coords )
		{
			errorList.push( "Failed to get the coordinates. " )
		}
	}

	if ( valid && coords )
	{
		//update the placement data
		log.l( "current database coords: ::" + JSON.stringify( data.placement ) );
		data.placement = coords;
		log.l( "updated database coords: ::" + JSON.stringify( data.placement ) );
		data.updatedBy = user;
		data.updatedOn = logTime();
		if ( task === "bt" )
		{
			data.sizes = [];
			for ( var size in coords )
			{
				data.sizes.push( size );
			}
		}

		database[ code ] = data;
		//write database file
		str += JSON.stringify( database );
		writeDatabase( dbPath, str );
	}

	if ( valid )
	{
		alert( "Successfully updated the database." );
	}

	if ( errorList.length > 0 )
	{
		sendErrors( errorList );
	}

	printLog();
	return valid;

}
updatePlacementData();
