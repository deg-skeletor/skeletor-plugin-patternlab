# Skeletor Pattern Lab Plugin
This plugin runs [Pattern Lab](http://patternlab.io) and is part of the Skeletor ecosystem. To learn more about Skeletor, [go here](https://github.com/deg-skeletor/skeletor-core).

## Installation
Install this plugin into your Skeletor-equipped project via the following terminal command: 
```
    npm install --save-dev @deg-skeletor/plugin-patternlab
```

## Configuration

### Example Configuration
```js
{
  patternExport: {
    patternGroups: [
      {
        patterns: 'components/*',
        dest: './dist/patterns/',
        includeHeadFoot: false
      },
      {
        patterns: 'pages/*',
        dest: './dist/patterns/',
        includeHeadFoot: true
      }
    ],
    assetPathReplacements: [
      {
        path: '../../images/',
        replacementPath: '/images/'
      },
      {
        path: '../../css/',
        replacementPath: '/styles/'
      }
    ]
  },  
  patternLabConfig: {
    "cacheBust": true,
    "cleanPublic" : true,
    "defaultPattern": "all",
    "defaultShowPatternInfo": false,
    "ishControlsHide": {
      "s": false,
      "m": false,
      "l": false,
      "full": false,
      "random": false,
      "disco": true,
      "hay": true,
      "mqs": false,
      "find": false,
      "views-all": false,
      "views-annotations": false,
      "views-code": false,
      "views-new": false,
      "tools-all": false,
      "tools-docs": false
    },
    "ishViewportRange": {
      "s": [240, 500],
      "m": [500, 800],
      "l": [800, 2600]
    },
    "logLevel": "info",
    "outputFileSuffixes": {
      "rendered": ".rendered",
      "rawTemplate": "",
      "markupOnly": ".markup-only"
    },
    "paths" : {
      "source" : {
        "root": "./source/",
        "patterns" : "./source/_patterns/",
        "data" : "./source/_data/",
        "meta": "./source/_meta/",
        "annotations" : "./source/_annotations/",
        "styleguide" : "./node_modules/styleguidekit-assets-default/dist/",
        "patternlabFiles" : "./node_modules/styleguidekit-mustache-default/views"
      },
      "public" : {
        "root" : "./public/",
        "patterns" : "./public/patterns/",
          "data" : "./public/styleguide/data/",
        "annotations" : "./public/annotations/",
          "styleguide" : "./public/styleguide/"
      }
    },
    "patternExtension": "mustache",
    "patternStateCascade": ["inprogress", "inreview", "complete"],
    "patternExportDirectory": "",
    "patternExportPatternPartials": [],
    "serverOptions": {
      "wait": 1000
    },
    "starterkitSubDir": "dist",
    "styleGuideExcludes": [],
    "theme": {
      "color": "dark",
      "density": "compact",
      "layout": "horizontal"
    }
  }
}
```

### Configuration Options

#### patternExport
Type: `Object`
An optional configuration object for exporting patterns.

#### patternExport.patternGroups
Type: `Array`
An array of one or more pattern group objects, each containing `patterns`, `dest`, and `includeHeadFoot` properties.

#### patternExport.assetPathReplacements
Type: `Array`
An array of one or more asset path replacement objects, each containing `path` and `replacementPath` properties.

#### patternLabConfig
Type: `Object`
The configuratin object for Pattern Lab. See the [official Pattern Lab documentation](http://patternlab.io/docs/advanced-config-options.html) for configuration details.