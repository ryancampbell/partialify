var through = require('through'),
  str2js = require('string-to-js'),
  types = ['html', 'css', 'json'];

function isValidFile (file) {
  return types.some(function (type) {
    return isFileType(file, type);
  });
}

function isFileType (file, type) {
	return file.substr(-(type.length)) === type;
}

function partialify (file) {

  if (!isValidFile(file)) return through();

  var buffer = "";

  return through(function (chunk) {
      buffer += chunk.toString();
    },
    function () {
      if (buffer.indexOf('module.exports') === 0) {
        this.queue(buffer); // prevent "double" transforms
      } else if (isFileType(file, 'json')) {
        var out = str2js(buffer);
        this.queue(
          out.substr(0, out.indexOf("'") - 1) +
          "JSON.parse(" +
	      out.substr(out.indexOf("'"),out.lasIndexOf("'")) +
	      ");"
        );
      } else {
        this.queue(str2js(buffer));
      }
      this.queue(null);
    });

};

exports.onlyAllow = function (extensions) {
  if (extensions) types = extensions;
  return partialify;
}

exports.alsoAllow = function (extensions) {
  types = types.concat(extensions);
  return partialify;
}
