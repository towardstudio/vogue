var glob = require('glob-promise');

module.exports = function(dir, lang) {
	
	return glob(`${dir}/**/*.${lang}`).then(function(files) {
		return files;
	})

}