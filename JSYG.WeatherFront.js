/*jshint forin:false, eqnull:true*/
/* globals JSYG*/

(function(factory) {
    
    if (typeof define != "undefined" && define.amd) define("jsyg-weatherfront",["jsyg","jsyg-path","jsyg-container"],factory);
    else if (typeof JSYG != "undefined") {
        if (JSYG.Path && JSYG.Container) factory(JSYG,JSYG.Path,JSYG.Container);
        else throw new Error("Dependency is missing");
    }
    else throw new Error("JSYG is needed");
    
})(function(JSYG,Path,Container) {
    
    "use strict";
    
    function WeatherFront(arg,opt) {
        
        this.container = new JSYG("<g>")[0];
        
        if (arg) this.setNode(arg);
        
        if (opt) this.enable(opt);
    }
    
    WeatherFront.types = {
        
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
    
    WeatherFront.prototype = new JSYG.StdConstruct;
    
    WeatherFront.prototype.constructor = WeatherFront;
    
    Object.defineProperty(WeatherFront.prototype,"type",{
        
        get : function() { return this._type; },
        
        set : function(value) {
            
            var lvalue = value.toLowerCase();
            var types;
            
            if (!(lvalue in WeatherFront.types)) {
                types = Object.keys(WeatherFront.types);
                throw new Error(value+" : type incorrect ("+types+" required)");
            }
            
            this._type = value;
        }
    });
    
    WeatherFront.prototype._type = "coldfront";
    
    
    WeatherFront.prototype.className = "weatherFront";
    
    WeatherFront.prototype.patternSpacing = 50;
    
    WeatherFront.prototype.patternScale = 'auto';
    
    WeatherFront.prototype.inverseAngle = false;
    
    WeatherFront.prototype._setHref = function(item) {
        
        item.attr("href",'#jsyg-'+this.type.toLowerCase());
        
        return this;
    };
    
    WeatherFront.prototype._idDefs = "jsyg-weatherfronts";
    
    WeatherFront.prototype._createDefs = function() {
        
        var defs = new JSYG('<defs>').attr('id',this._idDefs),
        that = this,
        type,name;
    
        for (name in WeatherFront.types) {
            
            type = WeatherFront.types[name];
            
            new JSYG('<path>').attr({
                id:"jsyg-"+name,
                d: type.path,
                fill: type.color
            })
            .appendTo(defs);
        }
                
        return defs[0];
    };
    
    WeatherFront.prototype._positionItem = function(item,length) {
        
        var path = new Path(this.node),
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
        
        new JSYG(this.container).find('g > use').remove();
        
        return this;
    };
    
    WeatherFront.prototype._getType = function() {
        
        return WeatherFront.types[ this.type.toLowerCase()];
    };
    
    WeatherFront.prototype.show = function() {
        
        if (!this.enabled) return this;
        
        this._clearItems();
        
        var jNode = new JSYG(this.node);
        var type = this._getType();
        
        this._originalColors = {
            stroke:jNode.css("stroke"),
            fill:jNode.css("fill")
        };
        
        jNode.css({
            "stroke":type.color,
            "fill":"none"
        });
        
        this.display = true;
        
        this.update();
        
        this.display = true;
        
        return this;
    };
    
    WeatherFront.prototype.calculateSize = function() {
        
        if (JSYG.isNumeric(this.patternScale)) return this.patternScale;
        
        var path = new JSYG(this.node),
        strokeWidth = parseFloat( path.css("stroke-width") || 1 );
        return 1 + (strokeWidth-1)/3;
    }
    
    WeatherFront.prototype.update = function() {
        
        if (!this.display) return this;
        
        var dim = this._geDimItem();
        var path = new Path(this.node),
        length = path.getLength(),
        g = new JSYG(this.container).find('g'),
        scale = this.calculateSize(),
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
        
        if (this._originalColors) jNode.css(this._originalColors);
        
        this._clearItems();
        
        this.display = false;
        
        return this;
    };
    
    WeatherFront.prototype.enable = function(opt) {
        
        if (this.enabled) this.disable();
        
        if (opt) this.set(opt);
        
        var parent = this.node.parentNode,
        svg = this.node.nearestViewportElement,
        defs;
        
        new JSYG(this.container)
            .addClass(this.className)
            .append(this.node)
            .append( new JSYG('<g>')[0] )
            .appendTo(parent);
        
        if (!(defs = document.getElementById(this._idDefs))) {
            svg = this.node.farthestViewportElement;
            svg.insertBefore( this._createDefs(), svg.firstChild );
        }
        
        this.enabled = true;
        
        this.show();
        
        return this;
    };
    
    WeatherFront.prototype.removeDefs = function() {
        
        var def = document.getElementById(this._idDefs);
        
        if (def) this.node.nearestViewportElement.removeChild(document.getElementById(this._idDefs));
        
        return this;
    }
    
    WeatherFront.prototype.disable = function() {
        
        if (!this.enabled) return this;
        
        this.hide();
        
        new Container(this.container).freeItems(this.node).empty().remove();
        
        this.enabled = false;
        
        return this;
    };
    
    var plugin = JSYG.bindPlugin(WeatherFront);
    
    JSYG.prototype.weatherFront = function() { return plugin.apply(this,arguments); };
    
    JSYG.WeatherFront = WeatherFront;
    
    return WeatherFront;
    
});