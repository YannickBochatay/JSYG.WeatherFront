# JSYG.WeatherFront
Weather front plugin for JSYG framework



##### Demo
[http://yannickbochatay.github.io/JSYG.WeatherFront](http://yannickbochatay.github.io/JSYG.WeatherFront/)



##### Installation
```shell
bower install jsyg-weatherfront
```


##### Example

HTML
```html
<svg width="500" height="500" id="editor">
    <path id="front" d="M189,131 C240.667,140.667 359.155,109.669 344,160 C311.65,267.433 93.4104,288.754 108,400 C120.29,493.714 292,443.333 384,465"/>
</svg>
```

Javascript
```javascript
new JSYG("#front").weatherFront({type:"coldfront"});
```