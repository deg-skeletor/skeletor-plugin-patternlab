const files = {};

function __setFileContents(filepath, contents) {
	files[filepath] = contents;
}

const readFile = jest.fn((filepath, format) => {
	if(files[filepath]) {
		return Promise.resolve(files[filepath]);
	}
	return Promise.reject('Could not find file ' + filepath);
});

const outputFile = jest.fn((file, data) => Promise.resolve());

const copy = jest.fn(() => Promise.resolve(true));

const fsExtra = {
	readFile,
	outputFile,
	copy,
	__setFileContents
};


module.exports = fsExtra;