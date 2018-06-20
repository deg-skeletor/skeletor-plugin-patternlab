const patternlab = require('patternlab-node');
const styleguideManager = require('./lib/styleguideManager');
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

function build(config, patternsOnly = false, doIncrementalBuild = false) {
	return new Promise((resolve, reject) => {
		const patternlabInst = patternlab(config);

		const onBuildComplete = () => {
			resolve(true);
		};
		
		try {
			if(patternsOnly) {
				patternlabInst.patternsonly(onBuildComplete, !doIncrementalBuild);
			} else {
				patternlabInst.build(onBuildComplete, !doIncrementalBuild);
			}
		} catch(e) {
			reject(e);
		}
		
	});
}

function handleError(e, logger) {
	logger.error(e);
	return buildErrorStatusObj(e);
}

function run(config, options) {
	const buildPatternsOnly = options.source ? true : false;

	const doIncrementalBuild = options.source ? 
		isPatternFile(options.source.filepath, config.paths.source) :
		false;

	const buildPromise = build(config, buildPatternsOnly, doIncrementalBuild);

	const finalPromise = buildPatternsOnly ? 
		buildPromise : 
		buildPromise.then(() => styleguideManager.copyAssets(config.paths));

	return finalPromise
			.then(buildCompleteStatusObj)
			.catch(e => handleError(e, options.logger));
}

module.exports = function(){
	return {
		run
	};
};