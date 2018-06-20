let relativeReturnVal = '';

function resolve() {
	return '';
}

function relative() {
	return relativeReturnVal;
}

function __setRelativeReturnValue(returnVal) {
	relativeReturnVal = returnVal;
}

function __reset() {
	relativeReturnVal = '';
}

const path = {
	resolve,
	relative,
	__setRelativeReturnValue,
	__reset
};


module.exports = path;