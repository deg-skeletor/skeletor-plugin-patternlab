const patternlab = require('patternlab-node');
const styleguideManager = require('./lib/styleguideManager');
const patternExporter = require('./lib/patternExporter');
const {isPatternFile} = require('./lib/utils');

function buildCompleteStatusObj() {
	return {
		status: 'complete'
	};
}

function buildErrorStatusObj(error) {
	return {
		status: 'error',
		message: error.message
	};
}

async function runBuildMethod(patternlabInst, method, config, options) {
	const {patternLabConfig, patternExport} = config;

	const doIncrementalBuild = options.source ?
		isPatternFile(options.source.filepath, patternLabConfig.paths.source) :
		false;

	await buildPatternLab(patternlabInst, method, doIncrementalBuild);

	if(!doIncrementalBuild && method !== 'patternsonly') {
		await styleguideManager.copyAssets(patternLabConfig.paths);
	}

	if(patternExport) {
		await patternExporter.exportPatterns(patternLabConfig, patternExport, options.logger);
	}
}

async function buildPatternLab(patternlabInst, method, doIncrementalBuild = false) {
	return new Promise((resolve, reject) => {
		const onBuildComplete = () => {
			resolve(true);
		};

		try {
			patternlabInst[method](onBuildComplete, !doIncrementalBuild);
		} catch(e) {
			reject(e);
		}
	});
}

function runNonBuildMethod(patternlabInst, method, methodArgs) {
	patternlabInst[method](...methodArgs);
}

function handleError(e, logger) {
	logger.error(e);
	return buildErrorStatusObj(e);
}

async function run(config, options) {
	try {
		const patternlabInst = patternlab(config.patternLabConfig);
		const method = config.method || 'build';

		if(method === 'build' || method === 'patternsonly') {
			await runBuildMethod(patternlabInst, method, config, options);
		} else {
			runNonBuildMethod(patternlabInst, method, config.methodArgs);
		}
	} catch(e) {
		return Promise.resolve(handleError(e, options.logger));
	}

	return Promise.resolve(buildCompleteStatusObj());
}

module.exports = function() {
	return {
		run
	};
};