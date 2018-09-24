let relativeReturnVal = '';

function resolve() {
	return '';
}

function relative() {
	return relativeReturnVal;
}

function join(val1, val2) {
	if(val1.endsWith('/')) {
		return `${val1}${val2}`;
	}
	return `${val1}/${val2}`;
}

function extname(filepath) {
	if(!filepath) {
		return '';
	}

	const parts = filepath.split('.');
	if(parts.length) {
		return `.${parts[parts.length-1]}`;
	}
	return '';
}

function basename(path) {
	const parts = path.split('/');
	return parts[parts.length - 1];
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
	join,
	extname,
	basename: basename,
	__setRelativeReturnValue,
	__reset
};

module.exports = path;