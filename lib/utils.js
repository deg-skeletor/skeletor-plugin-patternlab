const path = require('path');

function isPatternFile(filepath, sourcePaths) {
	if(path.extname(filepath) === '.json') {
		return false;
	}

	const relativePathToPatternsDir = path.relative(sourcePaths.patterns, filepath);
	return !relativePathToPatternsDir.startsWith('..');
}

function compose(...fns) {
	return x => fns.reduceRight((v, f) => f(v), x);
} 

module.exports = {
	isPatternFile,
	compose
}