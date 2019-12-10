'use strict';

const patternlab = jest.fn();

let initError = null;
let buildError = null;

function __reset() {
	initError = null;
	buildError = null;
	instance.build.mockClear();
	instance.patternsonly.mockClear();
	instance.loadstarterkit.mockClear();
}

function __setInitError(error) {
	initError = error;
}

function __setBuildError(error) {
	buildError = error;
}

function build(options) {
	if(buildError !== null) {
		return Promise.reject(buildError);
	}
	return Promise.resolve();
}

patternlab.__setInitError = __setInitError;
patternlab.__setBuildError = __setBuildError;
patternlab.__reset = __reset;

const instance = {
	build: jest.fn(build),
	patternsonly: jest.fn(build),
	loadstarterkit: jest.fn()
};

patternlab.mockImplementation(options => {
	if(initError) {
		throw initError;
	}

	return instance;
});

module.exports = patternlab;