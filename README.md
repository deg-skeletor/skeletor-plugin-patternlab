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
  },
  method: 'build',
  methodArgs: [],
  patternExport: {
    patternGroups: [
      {
        patterns: 'components/*',
        dest: './dist/patterns/',
        includeHeadFoot: false,
        flatten: false
      },
      {
        patterns: 'pages/*',
        dest: './dist/patterns/',
        includeHeadFoot: true,
        flatten: true
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
  }
}
```

### Configuration Options

#### patternLabConfig
Type: `Object`
The configuratin object for Pattern Lab. See the [official Pattern Lab documentation](http://patternlab.io/docs/advanced-config-options.html) for configuration details.

#### method (optional)
Type: `String`
The Pattern Lab method to execute. If omitted, this option defaults to `build`. Acceptable values include `build`, `patternsonly`, `version`, `help`, `liststarterkits`, and `loadstarterkit`.

#### methodArgs (optional)
Type: `Array`
An array of arguments to pass to the Pattern Lab method specified in the `method` configuration option. For example, the value of this option could be `['@deg-skeletor/starterkit-mustache-default']` for the `loadstarterkit` method.

#### patternExport (optional)
Type: `Object`
An optional configuration object for exporting patterns.

#### patternExport.patternGroups
Type: `Array`
An array of one or more pattern group objects, which define groups of patterns to export. A pattern group contains the following options:

##### patternGroup.patterns
Type: `String`
The path to the patterns to be exported. Globbing is supported. For example, `components/*` would export all patterns within the `components` directory.

##### patternGroup.dest
Type: `String`
The base destination directory to export the patterns to. Example: `./dist/patterns`. See the `patternGroup.flatten` option below for details on how exported patterns are organized within this base destination directory.

##### patternGroup.includeHeadFoot (optional)
Type: `Boolean`
Default: `false`
A flag for including the pattern header and footer in the exported patterns. If `false`, only a pattern's HTML will be exported.

##### patternGroup.flatten (optional)
Type: `Boolean`
Default: `false`
A flag for flattening all of the exported pattern files within the base destination directory. If `false`, pattern files will be exported to sub-directories within the destination directory that mimic the structure of the source pattern files. For example, given a base destination directory of `./dist/patterns`, a `components/frame/header.mustache` pattern would be exported to `./dist/patterns/frame/header.html`.

#### patternExport.assetPathReplacements
Type: `Array`
An array of one or more asset path replacement objects. Path replacement is useful for updating portions of asset paths (the `src` of an `<img>`, for example) within the HTML of patterns during export. For example, you may want to update the paths within the `src` of all `<img>` tags from  `../../images/` to `/images/`. A path replacement object contains the following options:

##### assetPathReplacement.path
Type: `String`
The asset path to target for replacement. For example, `../../images/`.

##### assetPathReplacement.replacementPath
Type: `String`
The path to replace targeted asset paths with. For example, `/images/`.