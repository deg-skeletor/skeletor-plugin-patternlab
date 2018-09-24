const path = require('path');

function isPatternFile(filepath, sourcePaths) {
	if(path.extname(filepath) === '.json') {
		return false;
	}

	const relativePathToPatternsDir = path.relative(sourcePaths.patterns, filepath);
	return !relativePathToPatternsDir.startsWith('..');
}

module.exports = {
	isPatternFile
}