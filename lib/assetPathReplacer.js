function replaceAssetPaths(fileContents, assetPathReplacements) {
    return assetPathReplacements.reduce((newFileContents, replacement) => {
        const pathRegex = new RegExp(replacement.path, 'ig');
        return newFileContents.replace(pathRegex, replacement.replacementPath);
    }, fileContents);
}

module.exports = {
    replaceAssetPaths
};