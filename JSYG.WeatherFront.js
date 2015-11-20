/*jshint forin:false, eqnull:true*/
/* globals JSYG*/

(function(factory) {
    
    if (typeof define != "undefined" && define.amd) define("jsyg-weatherfront",["jsyg","jsyg-path"],factory);
    else if (typeof JSYG != "undefined") {
        if (JSYG.Path) factory(JSYG);
        else throw new Error("You need JSYG.Path");
    }
    else throw new Error("JSYG is needed");
    
})(function(JSYG) {
    
    "use strict";
    
    function WeatherFront(arg) {
        
        this.container = new JSYG("<g>")[0];
        
        this.types = {
            "coldfront" : {
                color : "blue",
                path : "M-8,0 l8,-12 l8,12"
            },
            "warmfront" : {
                color : "red",
                path : "M-8,0 a8,8 0 0,1 16,0"
            },
            "occlusion" : {
                color : "darkviolet",
                path : "M-12,0 l6,-12 l6,12 a7,10 0 0,1 14,0"
            }
        };
        
        if (arg) this.setNode(arg);
    }
    
    WeatherFront.prototype = new JSYG.StdConstruct;
    
    WeatherFront.prototype.constructor = WeatherFront;
    
    WeatherFront.prototype.type = "coldfront";
    
    WeatherFront.prototype.patternSpacing = 50;
    
    WeatherFront.prototype.inverseAngle = false;
    
    WeatherFront.prototype._setHref = function(item) {
        
        item.attr("href",'#jsyg-'+this.type);
        
        return this;
    };
    
    WeatherFront.prototype._idDefs = "jsyg-weatherfronts";
    
    WeatherFront.prototype._createDefs = function() {
        
        var defs = new JSYG('<defs>').attr('id',this._idDefs),
            that = this;
        
        Object.keys(this.types).forEach(function(name) {
            
            var type = that.types[name];
            
            new JSYG('<path>').attr({
                id:"jsyg-"+name,
                d: type.path,
                fill: type.color
            })
            .appendTo(defs);
        });
                
        return defs[0];
    };
    
    WeatherFront.prototype._positionItem = function(item,length) {
        
        var path = new JSYG.Path(this.node),
        point = path.getPointAtLength(i),
        angle = path.getRotateAtLength(i);
        
        if (this.inverseAngle) angle+=180;
	
	item.setCenter(point);
        item.setMtx(path.getMtx());
        item.rotate(angle);
        item.scale(this._scale);
        item.translateY(-dim.height/2);
    };
    
    WeatherFront.prototype._geDimItem = function() {
        
        var item = new JSYG('<use>'),
        dim;
        
        this._setHref(item);
        item.css("visibility","hidden");
        
        this.container.appendChild(item[0]);
        
        dim = item.getDim();
        
        this.container.removeChild(item[0]);
        
        return dim;
    };
    
    WeatherFront.prototype.display = false;
    
    WeatherFront.prototype._clearItems = function() {
        
        new JSYG(this.container).find('use').remove();
        
        return this;
    };
    
    WeatherFront.prototype.show = function() {
        
        if (!this.enabled) return this;
        
        this._clearItems();
        
        var jNode = new JSYG(this.node);
        
        this._originalColor = jNode.css("stroke");
        
        jNode.css("stroke", this.types[this.type].color );
        
        this.display = true;
        
        this.update();
        
        this.display = true;
        
        return this;
    };
    
    WeatherFront.prototype.update = function() {
        
        if (!this.display) return this;
        
        var dim = this._geDimItem(),
        path = new JSYG.Path(this.node),
        length = path.getLength(),
        g = new JSYG(this.container),
        strokeWidth = parseFloat( path.css("stroke-width") || 1 ),
        scale = 1 + (strokeWidth-1)/3,
        spacing = Number(this.patternSpacing),
        use, point,angle, i, cpt = 1;
        
        for (i=dim.width*scale/2 ; i<=length-dim.width*scale/2 ; i+=spacing) {
            
            point = path.getPointAtLength(i);
            angle = path.getRotateAtLength(i);
            
            if (this.inverseAngle) angle+=180;
            
            use = g.find('use:nth-child('+cpt+')');
            
            if (!use.length) use = new JSYG('<use>').appendTo(g);
            
            this._setHref(use);
            
            use.setCenter(point);
            use.setMtx(path.getMtx());
            use.rotate(angle);
            use.scale(scale);
            use.translateY(-dim.height/2);
            
            cpt++;
        }
        
        while (use = g[0].querySelector('use:nth-child('+cpt+')')) this.container.removeChild(use);
        
        return this;
    };
    
    WeatherFront.prototype.hide = function() {
        
        var jNode = new JSYG(this.node);
        
        if (this._originalColor) jNode.css("stroke",this._originalColor);
        
        this._clearItems();
        
        this.display = false;
        
        return this;
    };
    
    WeatherFront.prototype.enable = function(opt) {
        
        if (opt) this.set(opt);
        
        var parent = this.node.parentNode,
        svg = this.node.nearestViewportElement,
        defs;
        
        this.container.appendChild(this.node);
        
        parent.appendChild(this.container);
        
        if (!(defs = document.getElementById(this._idDefs))) {
            svg = this.node.farthestViewportElement;
            svg.insertBefore( this._createDefs(), svg.firstChild );
        }
        
        this.enabled = true;
        
        this.show();
        
        return this;
    };
    
    WeatherFront.prototype.disable = function() {
        
        var parent = this.container.parentNode;
        
        parent.appendChild(this.node);
        
        parent.removeChild(this.container);
        
        this._clearItems();
        
        this.node.nearestViewportElement.removeChild(document.getElementById(this._idDefs));
        
        this.enabled = false;
        
        return this;
    };
    
    var plugin = JSYG.bindPlugin(WeatherFront);
    
    JSYG.prototype.weatherFront = function() { return plugin.apply(this,arguments); };
    
    JSYG.WeatherFront = WeatherFront;
    
    return WeatherFront;
    
});