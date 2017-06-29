# Sending emails via a map in iMIS

This iPart uses the ArcGIS Javascript API to initiate an email to a selected region of contacts on an interactive map.

![GEOLOCATION](https://media.giphy.com/media/xUA7aVDcAMWYZoKHEQ/giphy.gif)

## Purpose
This tool was created to easily contact groups of growers by email for targeted communications. This provides custom access to growers, on demand.

## Stage 1: As a web page
The first iteration is a standalone HTML page that plots given coordinates, and a user can draw an area onto the map interface. An email can then be prompted by pressing the "email" button, which includes all of the email addresses in the selected region.

The ArcGIS API uses lots of dojo, which is a JS framework, and something I was not at all familiar with. In this application we require the following libraries.

{% highlight javascript %}
dojo.require("esri.map");
dojo.require("esri.toolbars.draw");
dojo.require("esri.tasks.query");
dojo.require("esri.graphic");
dojo.require("esri.geometry.Point");
dojo.require("esri.InfoTemplate");
dojo.require("esri.symbols.SimpleMarkerSymbol");
dojo.require("esri.renderers.SimpleRenderer");
{% endhighlight %}

```dojo.require``` is a way for us to load in relevant scripts.

### Formatting
Notice how the selected points are highlighted? This is to show the user which points have been selected by their drawn area. In order to 

{% highlight javascript %}
//initialize points - HortNZ colours to be consistent with brand standards
defaultSymbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([140,198,63])).setSize(10);
highlightSymbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([230,255,160])).setSize(10);
{% endhighlight %}


### Email
The email message is easily set up from the results of each plot point in the selected region. To do this you need to configure the 
```Javascript

```


## Stage 2: As an iPart
The next step is to use real data from iMIS, live and in real-time. For this task we require our database to become a geoDB. I'm also going to build this in an *.ascx* controller script, rather than a complete iPart. The script will have both **C#** and **Javascript** script tags, so that we can work with the ArcGIS API in Javascript.

### Geocoding
To create a geoDB we geocode all of the addresses in iMIS from the **address** table, to create a **geolocation** table, which we are going to import back into iMIS.
For this task we use the **google maps API**. Since we only need to do this once, I use python for the script along with the **geocoder** library. Unfortunately the API only allows 2500 free requests per day, since there are more than that in our database, we run this on batches over multiple days. The imports look like this:

{% highlight python %}
import geocoder as g
import pandas as pd
{% endhighlight %}


### Connecting C# and Javascript
Unfortunately there is a flaw in using both **C#** and **JS** - which is array sharing. Since the data is pulled from a secure connection, we can only use a protected class. But we need to pass the array of growers from the server side through to the javascript on the client side, which isn't that straightforward to do.

The **C#** code uses the Asi.Data.Dataserver object to connect to the database.

{% highlight c# %}
Asi.Data.DataServer dserver = new Asi.Data.DataServer(Asi.iBO.iboAdmin.ConnectionString);
{% endhighlight %}

While there is almost certainly a better way to do this, what I have done is save the array in a hidden ```<p>``` tag in **C#**, then read it to an array with javascript. 

To do this, we first need the query results. This is a straightforward **SQL** query which should look something like (query not exactly the same):

{% highlight sql %}
SELECT Latitude,Longitude,Company,Email FROM Name 
INNER JOIN Geolocation 
ON Name.Address_Number = Geolocation.Address_Number
WHERE Email != ''
AND Status = 'A';
{% endhighlight %}

### Integrating with iMIS dashboards / pages
Since our .ascx file is implanted into the body field, and our 
We make another script tag to "inject" html, css and javascript into the head of the webpage.
{% highlight javascript %}
function loadCSS(filename) {
        var file = document.createElement("link");
        file.setAttribute("rel", "stylesheet");
        file.setAttribute("type", "text/css");
        file.setAttribute("href", filename);
        document.head.appendChild(file);
}
//load the new CSS
loadCSS("https://js.arcgis.com/3.20/dijit/themes/claro/claro.css");
loadCSS("https://js.arcgis.com/3.20/esri/css/esri.css");

// add the body class to be claro for mapping
document.getElementsByTagName("body")[0].class = "claro";
document.getElementsByTagName("body")[0].onload = "updateVariables()";
{% endhighlight %}

Once the .ascx file has been created, it is easy to import into an iMIS page in RiSE. 
