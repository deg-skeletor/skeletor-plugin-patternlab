const patternlabPlugin = require('./index');
const patternlab = require('patternlab-node');
const styleguideManager = require('./lib/styleguideManager');
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

const validConfig = {
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
	}
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
		expect(patternlab).toHaveBeenCalledWith(validConfig);
	});
});

describe('When run() is invoked normally', () => {
	test('styleguide assets are copied to the public folder', async () => {
		const copyAssetsSpy = jest.spyOn(styleguideManager, 'copyAssets');

		await patternlabPlugin().run(validConfig, pluginOptions);
		expect(copyAssetsSpy).toHaveBeenCalledTimes(1);
		expect(copyAssetsSpy).toHaveBeenCalledWith(validConfig.paths);
	});

	test('the Pattern Lab build() method is invoked', async () => {
		const patternlabInst = patternlab(validConfig);
		const buildSpy = jest.spyOn(patternlabInst, 'build');

		await patternlabPlugin().run(validConfig, pluginOptions);
		expect(buildSpy).toHaveBeenCalledTimes(1);
		expect(buildSpy).toHaveBeenCalledWith(expect.any(Function), true);
	});
});

describe('When run() is invoked as a result of a changed file', () => {
	test('the Pattern Lab build() method is invoked for an incremental build', async () => {
		const patternlabInst = patternlab(validConfig);
		const buildSpy = jest.spyOn(patternlabInst, 'build');

		const pluginOptions = {...patternsOnlyPluginOptions};
		pluginOptions.source.filename = 'source/_patterns/pattern.mustache';

		path.__setRelativeReturnValue('pattern.mustache');

		await patternlabPlugin().run(validConfig, patternsOnlyPluginOptions);
		expect(buildSpy).toHaveBeenCalledTimes(1);
		expect(buildSpy).toHaveBeenCalledWith(expect.any(Function), false);
	});

	test('the Pattern Lab build() method is invoked for a full build', async () => {
		const patternlabInst = patternlab(validConfig);
		const buildSpy = jest.spyOn(patternlabInst, 'build');

		const pluginOptions = {...patternsOnlyPluginOptions};
		pluginOptions.source.filename = 'source/_data/data.json';

		path.__setRelativeReturnValue('../_data/data.json');

		await patternlabPlugin().run(validConfig, patternsOnlyPluginOptions);
		expect(buildSpy).toHaveBeenCalledTimes(1);
		expect(buildSpy).toHaveBeenCalledWith(expect.any(Function), true);
	});

	test('no styleguide assets are copied to the public folder', async () => {
		const copyAssetsSpy = jest.spyOn(styleguideManager, 'copyAssets');

		await patternlabPlugin().run(validConfig, patternsOnlyPluginOptions);
		expect(copyAssetsSpy).not.toHaveBeenCalled();
	});
});