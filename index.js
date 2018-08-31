const patternlab = require('patternlab-node');
const styleguideManager = require('./lib/styleguideManager');
const patternExporter = require('./lib/patternExporter');
const { isPatternFile } = require('./lib/utils');

function buildCompleteStatusObj() {
	return {
		status: 'complete'
	};
}

function buildErrorStatusObj(error) {
	return {
		status: 'error', 
		message: error.message
	};''
}

async function build(config, doIncrementalBuild = false) {
	return new Promise((resolve, reject) => {
		const patternlabInst = patternlab(config);

		const onBuildComplete = () => {
			resolve(true);
		};
		
		try {
			patternlabInst.build(onBuildComplete, !doIncrementalBuild);
		} catch(e) {
			reject(e);
		}
		
	});
}

function handleError(e, logger) {
	logger.error(e);
	return buildErrorStatusObj(e);
}

async function run(config, options) {
	const { patternLabConfig, patternExport } = config;

	const doIncrementalBuild = options.source ? 
		isPatternFile(options.source.filepath, patternLabConfig.paths.source) :
		false;

	try {
		await build(patternLabConfig, doIncrementalBuild);
	} catch(e) {
		return Promise.resolve(handleError(e, options.logger));
	}

	if(!doIncrementalBuild) {
		try {
			await styleguideManager.copyAssets(patternLabConfig.paths);
		} catch(e) {
			return Promise.resolve(handleError(e, options.logger));
		}
	}

	if(patternExport) {
		try {
			await patternExporter.exportPatterns(patternLabConfig, patternExport, options.logger);
		} catch(e) {
			return Promise.resolve(handleError(e, options.logger));
		}
	}

	return Promise.resolve(buildCompleteStatusObj());
}

module.exports = function(){
	return {
		run
	};
};