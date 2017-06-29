    // get the metadata from inner html javascript
      var emails = document.getElementById("hidden_data").innerHTML.split(',');
      console.log(emails);
      console.log("printed data ^^");

      dojo.require("esri.map");
      dojo.require("esri.toolbars.draw");
      dojo.require("esri.tasks.query");
      dojo.require("esri.graphic");
      dojo.require("esri.geometry.Point");
      dojo.require("esri.InfoTemplate");
      dojo.require("esri.symbols.SimpleMarkerSymbol");
      dojo.require("esri.renderers.SimpleRenderer");

      //global variables
      var map, defaultSymbol, highlightSymbol, resultTemplate;

      function init() {
        //create map, set initial extent and disable default info window behavior
        map = new esri.Map("map", {
          basemap: "hybrid",
          center: [172.47, -41.02176],
          zoom: 6,
          slider: true,
          showInfoWindowOnClick:true
        });
        dojo.connect(map, "onLoad", initToolbar);
        console.log("made the map");
        //initialize symbology
        defaultSymbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([140,198,63])).setSize(10);
        highlightSymbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([230,255,160])).setSize(10);


        var maxlat = -40+5;
        var minlat = -40-5;
        var maxlon = 175.47+1;
        var minlon = 175.47-3;
        var grpcs = [];
        for (i = 0; i < 100; i++) {
            // get a random number for lats and longs/
          var r2 = Math.random() * (maxlat - minlat-3) + minlat ;
          var r1 = Math.random() * (maxlon - minlon) + minlon + (r2 + 41);

           // plot these random coordinates
          var p = new esri.geometry.Point([r1, r2]);
          // set up their email address as a feature - take from array
          var attr = {City: emails[i],Status: "OK"};
          resultTemplate = new esri.InfoTemplate("City","${City};");
          var g = new esri.Graphic(p,defaultSymbol,attr, resultTemplate);
          console.log('pushed graphic through - ', attr);
          grpcs.push(g.setSymbol(defaultSymbol)); // append to array
        }

        //dojo.connect(map, "onLoad",addPointsToMap);// now add points
        map.on('load',function(){
          console.log("loaded points");
          for (i = 0; i < grpcs.length; ++i){
          //gl.add(grpcs);
            map.graphics.add(grpcs[i]);
            console.log("plotted point");
          }
        });

      }

      //initialize drawing toolbar
      function initToolbar(map) {
        var tb = new esri.toolbars.Draw(map);

        //find points in Extent when user completes drawing extent
        dojo.connect(tb, "onDrawEnd", findPointsInExtent);

        //set drawing mode to extent
        tb.activate(esri.toolbars.Draw.FREEHAND_POLYGON);
      }

      //find all points within argument extent
      function findPointsInExtent(extent) {
        var results = [];
        dojo.forEach(map.graphics.graphics,function(graphic){
          if (extent.contains(graphic.geometry)) {
            graphic.setSymbol(highlightSymbol);
            results.push(graphic.getContent());
            console.log(graphic.getContent());
          }
          //else if point was previously highlighted, reset its symbology
          else if (graphic.symbol == highlightSymbol) {
            graphic.setSymbol(defaultSymbol);
          }
        });

        //generate email message
        window.location.href = "mailto:?bcc=" + results.toString().replace(/,/g, '');
       }

      dojo.addOnLoad(init);
