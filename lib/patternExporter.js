const fse = require('fs-extra');
const glob = require('globby');
const path = require('path');
const beautifyHtml = require('js-beautify').html;
const { compose } = require('./utils');
const assetPathReplacer = require('./assetPathReplacer');

const beautifierOptions = {
    preserve_newlines: false, 
    indent_inner_html: true,
    extra_liners: [],
    indent_with_tabs: true
};

function stripPatternLabMarkup(fileData) {
    return fileData.replace(/<!-- Begin Pattern Lab.*-->[\s\S]*?<!-- End Pattern Lab.*-->/ig, '');
}

function filterPatternHtmlFile(filepath, includeHeadFoot) {
    if(filepath.includes('-_')) {
        return false;
    }
    return includeHeadFoot ? filepath.endsWith('.rendered.html') : filepath.endsWith('.markup-only.html');
}

/*
    Converts a pattern matching string like "components/frame/*" to a 
    glob pattern like "patternlab/patterns/*\/components-??-frame-*"
*/
function convertPatternMatcherToGlobPattern(patternMatcher, patternBasePath) {
    const patternMatcherParts = patternMatcher.split('/');
    const baseGlobPattern = path.join(patternBasePath, '*/');
    return patternMatcherParts.reduce((fullPath, pathPart, index) => {
        let prefix = index === 0 ? fullPath : `${fullPath}-`;

        if(pathPart === '*') {
            return `${prefix}${pathPart}`;
        }
        return `${prefix}??-${pathPart}`;
    }, baseGlobPattern);
}

function createPatternFileSuffixRegExp({rendered, markupOnly}) {
    const suffixArr = [rendered, markupOnly];
    const regExpString = suffixArr.map(suffix => {
        return `\\.${suffix.replace('.', '')}\\.`;
    }).join('|')

    return new RegExp(regExpString);
}

function getFlattenedDestFilepath(filenameParts, destDir) {
    const lastFilenamePart = filenameParts[filenameParts.length - 1];
    return path.join(destDir, lastFilenamePart);
}

function getNestedDestFilepath(filenameParts, destDir) {
    return filenameParts.reduce((destFilepath, part) => {
        return path.join(destFilepath, part);
    }, destDir);
}

/* 
    Given a source filepath like "./public/patterns/00-components-01-frame-00-header/00-components-01-frame-00-header.rendered.html"
    and a destination directory like "dist/patterns/", 
    returns a nested destination filepath like "dist/patterns/components/frame/header.html"
    or a flattened destination filepath like "dist/patterns/header.html"
*/
function getPatternDestFilepath(srcFilepath, destDir, flatten, suffixRegExp) {
    const srcFilename = path.basename(srcFilepath);
    const filenameParts = srcFilename.split(/-?\d\d-/).filter(part => part !== '');

    const destFilepath = flatten ? 
        getFlattenedDestFilepath(filenameParts, destDir) : 
        getNestedDestFilepath(filenameParts, destDir);
    
    return destFilepath.replace(suffixRegExp, '.');
}

async function readFile(filepath, logger) {
    let fileContents = null;
    
    try {
        fileContents = await fse.readFile(filepath, 'utf8');
    } catch(e) {
        logger.error(`Error reading file "${filepath}": ${e}`);
    }

    return fileContents;
}

async function writeFile(filepath, contents, logger) {
    try {
        await fse.outputFile(filepath, contents);
        logger.info(`Exported pattern: ${filepath}`);
        return true;
    } catch(e) {
        logger.error(`Error writing file "${filepath}": ${e}`);
        return false;
    }
}

async function exportPatternFile(patternFilepath, {dest: destDir, flatten}, assetPathReplacements, suffixRegExp, logger) {
    const destFilepath = getPatternDestFilepath(patternFilepath, destDir, flatten, suffixRegExp);
    const fileData = await readFile(patternFilepath, logger);
    
    if(fileData) {
        const replaceAssetPaths = fileData => assetPathReplacer.replaceAssetPaths(fileData, assetPathReplacements);
        const beautify = fileData => beautifyHtml(fileData, beautifierOptions);
        const processFileData = compose(beautify, replaceAssetPaths, stripPatternLabMarkup);
        
        const processedFileData = processFileData(fileData);
        return await writeFile(destFilepath, processedFileData, logger);
    }

    return false;
}

async function exportPatternGroup(plConfig, patternGroupConfig, assetPathReplacements, suffixRegExp, logger) { 
    logger.info(`Exporting patterns for "${patternGroupConfig.patterns}".`);

    const globPattern = convertPatternMatcherToGlobPattern(patternGroupConfig.patterns, plConfig.paths.public.patterns);
    const patternFilepaths = await glob(globPattern);
    
    const promises = patternFilepaths
        .filter(filepath => filterPatternHtmlFile(filepath, patternGroupConfig.includeHeadFoot))
        .map(filepath => exportPatternFile(filepath, patternGroupConfig, assetPathReplacements, suffixRegExp, logger));

    return Promise.all(promises)
        .then(results => results.every(result => result === true));
}

function exportPatterns(plConfig, exportConfig, logger) {    
    const suffixRegExp = createPatternFileSuffixRegExp(plConfig.outputFileSuffixes);
    const assetPathReplacements = exportConfig.assetPathReplacements || [];

    return Promise.all(
        exportConfig.patternGroups.map(patternGroupConfig =>
            exportPatternGroup(plConfig, patternGroupConfig, assetPathReplacements, suffixRegExp, logger)
        )
    ).then(results => results.every(result => result === true));
}

module.exports = {
    exportPatterns
};