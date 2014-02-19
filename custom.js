var through = require('through'),
  str2js = require('string-to-js'),
  types = ['html', 'css', 'json'],
  processes = {};

function isValidFile (file) {
  return types.some(function (type) {
    return isFileType(file, type);
  });
}

function isFileType (file, type) {
  return file.substr(-(type.length)) === type;
}

function getFileProcess (file) {
  for (var type in processes) {
    if (isFileType(file, type)) {
      return processes[type];
    }
  }

  return str2js;
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
      } else {
        this.queue(getFileProcess(file)(buffer));
      }
      this.queue(null);
    });

};

exports.process = function (type, func) {
  processes[type] = func;
}

exports.onlyAllow = function (extensions) {
  if (extensions) types = extensions;
  return partialify;
}

exports.alsoAllow = function (extensions) {
  types = types.concat(extensions);
  return partialify;
}
