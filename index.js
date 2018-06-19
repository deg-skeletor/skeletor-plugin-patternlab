const patternlab = require('patternlab-node');
const styleguideManager = require('./lib/styleguideManager');

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

function build(config, patternsOnly = false) {
	return new Promise((resolve, reject) => {
		const patternlabInst = patternlab(config);

		const onBuildComplete = () => {
			resolve(true);
		};
		
		try {
			if(patternsOnly) {
				patternlabInst.patternsonly(onBuildComplete);
			} else {
				patternlabInst.build(onBuildComplete);
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

	const buildPromise = build(config, buildPatternsOnly);

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