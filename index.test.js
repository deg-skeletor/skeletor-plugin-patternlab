const patternlabPlugin = require('./index');
const patternlab = require('@pattern-lab/core');
const patternExporter = require('./lib/patternExporter');
const path = require('path');

jest.mock('path');

const logger = {
	info: () => {},
	warn: () => {},
	error: () => {}
};

const pluginOptions = {
	logger
};

const patternsOnlyPluginOptions = {
	logger,
	source: {
		filename: ''
	}
};

const patternLabConfig = {
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
		"disco": false,
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
			"styleguide": "./dist/",
			patternlabFiles: {
				"general-header": "./views/partials/general-header.mustache",
				"general-footer": "./views/partials/general-footer.mustache",
				"patternSection": "./views/partials/patternSection.mustache",
				"patternSectionSubtype": "./views/partials/patternSectionSubtype.mustache",
				"viewall": "./views/viewall.mustache"
			}
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
	"patternExportDirectory": "./pattern_exports/",
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
	},
	"uikits": [
		{
		  "name": "uikit-workshop",
		  "outputDir": "",
		  "enabled": true,
		  "excludedPatternStates": [],
		  "excludedTags": []
		}
	]
};

const validConfig = {
	patternLabConfig
};

beforeEach(() => {
	jest.restoreAllMocks();

	patternlab.mockClear();

	patternlab.__reset();

	path.__reset();
});

describe('run() returns an error status object', () => {
	test('when config object is invalid', async () => {
		const config = {};

		const expectedResponse = {
			status: 'error',
			message: expect.any(String)
		};

		const response = await patternlabPlugin().run(config, pluginOptions);
		expect(response).toEqual(expectedResponse);
	});

	test('when Pattern Lab initialization fails', async () => {		
		const initError = new Error('initialization error');

		patternlab.__setInitError(initError);

		const expectedResponse = {
			status: 'error',
			message: initError.message
		};

		const response = await patternlabPlugin().run(validConfig, pluginOptions);
		expect(response).toEqual(expectedResponse);
	});

	test('when Pattern Lab build fails', async () => {
		const buildError = new Error('build error');

		patternlab.__setBuildError(buildError);

		const expectedResponse = {
			status: 'error',
			message: buildError.message
		};

		const response = await patternlabPlugin().run(validConfig, pluginOptions);
		expect(response).toEqual(expectedResponse);
	});
});

describe('run() returns a complete status object', () => {
	test('when Pattern Lab build is successful', async () => {
		const expectedResponse = {
			status: 'complete'
		};

		const result = await patternlabPlugin().run(validConfig, pluginOptions);
		expect(result).toEqual(expectedResponse);
	});

	test('when Pattern Lab patterns-only build is successful', async () => {
		const expectedResponse = {
			status: 'complete'
		};

		const result = await patternlabPlugin().run(validConfig, patternsOnlyPluginOptions);
		expect(result).toEqual(expectedResponse);
	});
});

describe('run() initializes Pattern Lab with the correct configuration', () => {
	test('when a valid configuration is provided', async () => {
		await patternlabPlugin().run(validConfig, pluginOptions);
		expect(patternlab).toHaveBeenCalledTimes(1);
		expect(patternlab).toHaveBeenCalledWith(validConfig.patternLabConfig);
	});
});

describe('When run() is invoked normally', () => {
	test('the Pattern Lab build() method is invoked', async () => {
		const patternlabInst = patternlab(validConfig);

		await patternlabPlugin().run(validConfig, pluginOptions);
		expect(patternlabInst.build).toHaveBeenCalledTimes(1);
		expect(patternlabInst.build).toHaveBeenCalledWith({cleanPublic: true});
	});
});

describe('When run() is invoked as a result of a changed', () => {
	test('pattern file, the Pattern Lab build() method is invoked for an incremental build', async () => {
		const patternlabInst = patternlab(validConfig);

		const pluginOptions = {...patternsOnlyPluginOptions};
		pluginOptions.source.filepath = 'source/_patterns/pattern.mustache';

		path.__setRelativeReturnValue('pattern.mustache');

		await patternlabPlugin().run(validConfig, pluginOptions);
		expect(patternlabInst.build).toHaveBeenCalledTimes(1);
		expect(patternlabInst.build).toHaveBeenCalledWith({cleanPublic: false});
	});

	test('meta pattern file, the Pattern Lab build() method is invoked for a full build', async () => {
		const patternlabInst = patternlab(validConfig);

		const pluginOptions = {...patternsOnlyPluginOptions};
		pluginOptions.source.filepath = 'source/_meta/_00-head.mustache';

		path.__setRelativeReturnValue('../_meta/_00-head.mustache');

		await patternlabPlugin().run(validConfig, pluginOptions);
		expect(patternlabInst.build).toHaveBeenCalledTimes(1);
		expect(patternlabInst.build).toHaveBeenCalledWith({cleanPublic: true});
	});

	test('data.json file, the Pattern Lab build() method is invoked for a full build', async () => {
		const patternlabInst = patternlab(validConfig);

		const pluginOptions = {...patternsOnlyPluginOptions};
		pluginOptions.source.filepath = 'source/_data/data.json';

		path.__setRelativeReturnValue('../_data/data.json');

		await patternlabPlugin().run(validConfig, pluginOptions);
		expect(patternlabInst.build).toHaveBeenCalledTimes(1);
		expect(patternlabInst.build).toHaveBeenCalledWith({cleanPublic: true});
	});

	test('pattern JSON file, the Pattern Lab build() method is invoked for a full build', async () => {
		const patternlabInst = patternlab(validConfig);

		const pluginOptions = {...patternsOnlyPluginOptions};
		pluginOptions.source.filepath = 'source/_patterns/04-pages/00-homepage.json';

		path.__setRelativeReturnValue('./04-pages/00-homepage.json');

		await patternlabPlugin().run(validConfig, pluginOptions);
		expect(patternlabInst.build).toHaveBeenCalledTimes(1);
		expect(patternlabInst.build).toHaveBeenCalledWith({cleanPublic: true});
	});
});

describe('When run() is invoked with a patternExport configuration', () => {

	const configWithExport = {
		...validConfig,
		patternExport: {
			patternGroups: [
				{
					patterns: 'components/*',
					dest: './dist/patterns/',
					includeHeadFoot: true
				}
			],
			assetPathReplacements: [
				{
					path: '../../images/',
					replacementPath: '/images/'
				}
			]
		}
	};

	test('the pattern exporter is invoked with the correct parameters', async () => {
		const exportPatternsSpy = jest.spyOn(patternExporter, 'exportPatterns');

		await patternlabPlugin().run(configWithExport, pluginOptions);
		expect(exportPatternsSpy).toHaveBeenCalledTimes(1);
		expect(exportPatternsSpy).toHaveBeenCalledWith(configWithExport.patternLabConfig, configWithExport.patternExport, logger);
	});
});

describe('When run() is invoked with a method is specified', () => {
	
	test('it runs the build method', async () => {
		const configWithMethod = {
			...validConfig,
			method: 'build'
		};

		const patternlabInst = patternlab(validConfig);
		await patternlabPlugin().run(configWithMethod, pluginOptions);

		expect(patternlabInst.build).toHaveBeenCalledTimes(1);
		expect(patternlabInst.build).toHaveBeenCalledWith({cleanPublic: true});
	});

	test('it runs the patternsonly method', async () => {
		const configWithMethod = {
			...validConfig,
			method: 'patternsonly'
		};

		const patternlabInst = patternlab(validConfig);

		await patternlabPlugin().run(configWithMethod, pluginOptions);

		expect(patternlabInst.patternsonly).toHaveBeenCalledTimes(1);
		expect(patternlabInst.patternsonly).toHaveBeenCalledWith({cleanPublic: true});
	});

	test('it runs the loadstarterkit method', async () => {
		const starterkit = '@deg-skeletor/starterkit-mustache-default';
		
		const configWithMethod = {
			...validConfig,
			method: 'loadstarterkit',
			methodArgs: [starterkit]
		};

		const patternlabInst = patternlab(validConfig);

		await patternlabPlugin().run(configWithMethod, pluginOptions);

		expect(patternlabInst.loadstarterkit).toHaveBeenCalledTimes(1);
		expect(patternlabInst.loadstarterkit).toHaveBeenCalledWith(starterkit);
	});
});