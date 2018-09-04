let patternPaths = {};

function __setPatternPaths(value) {
    patternPaths = value;
}

const globby = jest.fn(pattern => {
    if(patternPaths.hasOwnProperty(pattern)) {
        return Promise.resolve(patternPaths[pattern]);
    }

    return Promise.resolve([]);
});

globby.__setPatternPaths = __setPatternPaths;

module.exports = globby;