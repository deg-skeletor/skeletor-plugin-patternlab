const patternlab = require('@pattern-lab/core');
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

	if(patternExport) {
		await patternExporter.exportPatterns(patternLabConfig, patternExport, options.logger);
	}
}

async function buildPatternLab(patternlabInst, method, doIncrementalBuild = false) {
	const options = {
		cleanPublic: !doIncrementalBuild
	};

	return patternlabInst[method](options);
}

function runNonBuildMethod(patternlabInst, method, methodArgs) {
	patternlabInst[method](...methodArgs);
}

function handleError(e, logger) {
	logger.error(e);
	return buildErrorStatusObj(e);
}

async function run(config, options) {
	if(typeof config === 'undefined' || typeof config.patternLabConfig === 'undefined') {
		return Promise.resolve(handleError(new Error('Invalid configuration object'), options.logger));
	}

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