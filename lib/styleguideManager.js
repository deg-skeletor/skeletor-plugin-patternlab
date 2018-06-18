const fse = require('fs-extra');
const path = require('path');

function copyAssets(paths) {
	return new Promise(resolve => {
		const assetsSourceDir = path.resolve(paths.source.styleguide, 'styleguide');
		const assetsDestDir = paths.public.styleguide;
		return fse.copy(assetsSourceDir, assetsDestDir)
			.then(resolve(true));
	});
}

module.exports = {
	copyAssets
};