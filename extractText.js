var fs = require('fs');
var path = require('path');
var dir = require('node-dir');
var tika = require('tika');

// Configuration
var inputFolder = './pdf/';
var outputFolder = './text/';

// Tika and OCR options
var options = {

  contentType: 'application/pdf',
  ocrLanguage: 'por',
  pdfEnableAutoSpace: true,
  pdfExtractInlineImages: true
};

(function init() {

  readFiles(processFiles);
})();

function readFiles(callback) {

  // Get a list of all files
  dir.files(inputFolder, function(error, files) {

    if (error) throw error;

    // Include PDF files only
    files = files.filter(function (file) {

      return file.search(/.*.pdf/) > -1;
    });

    callback(files);
  });
}

function processFiles(files) {

  var filesCount = files.length;

  console.log('Started file processing (' + (new Date().toLocaleString()) + ')');

  // Recursively process the files
  (function recurse() {

    if (files.length > 0) {

      console.log('Processing file ' + (filesCount - files.length + 1) + ' of ' + filesCount);

      extractText(files.pop(), recurse);
    } else {

      console.log('Finished processing ' + filesCount + ' files (' + (new Date().toLocaleString()) + ')');
    }
  })(files);
}

function extractText(filePath, callback) {

  // Extract text from PDF file
  tika.text(filePath, options, function (error, text) {

    if (error) throw error;

    var fileName = filePath.substr(filePath.lastIndexOf('/') + 1);

    // Save extracted content as text file
    saveFile(outputFolder + fileName + '.txt', text);
    callback();
  });
}

function saveFile(relativePath, string) {

  // Normalize file path
  relativePath = path.normalize(relativePath);

  try {

    console.log('Saved file', relativePath);

    // Save file
    return fs.writeFileSync(relativePath, string, 'utf8');
  } catch (error) {

    console.log(error);
  }
}
