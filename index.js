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
			resolve(buildCompleteStatusObj());
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

	const promise = buildPatternsOnly ?
		build(config, buildPatternsOnly) :
		styleguideManager.copyAssets(config.paths)
			.then(() => build(config, buildPatternsOnly));

	return promise
		.catch(e => handleError(e, options.logger));
}

module.exports = function(){
	return {
		run
	};
};