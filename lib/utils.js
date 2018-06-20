const path = require('path');

function isPatternFile(filepath, sourcePaths) {
	const relativePathToPatternsDir = path.relative(sourcePaths.patterns, filepath);
	return !relativePathToPatternsDir.startsWith('..');
}

module.exports = {
	isPatternFile
}