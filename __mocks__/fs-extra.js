function copy() {
	return new Promise((resolve, reject) => resolve(true));
}

const fsExtra = {
	copy
};


module.exports = fsExtra;