'use strict';

//const patternlab = jest.genMockFromModule('patternlab-node');

const patternlab = jest.fn();

let initError = null;
let buildError = null;

function __reset() {
	initError = null;
	buildError = null;
}

function __setInitError(error) {
	initError = error;
}

function __setBuildError(error) {
	buildError = error;
}

function build(callback, options) {
	if(buildError !== null) {
		throw buildError;
	}
	return callback();
}

patternlab.__setInitError = __setInitError;
patternlab.__setBuildError = __setBuildError;
patternlab.__reset = __reset;

const instance = {
	build,
	patternsonly: build
};

patternlab.mockImplementation(options => {
	if(initError) {
		throw initError;
	}

	return instance;
});

module.exports = patternlab;