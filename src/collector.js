const Request = require('request');
const fs = require('fs');
const beautify = require('js-beautify').js_beautify;
const crypto = require('crypto');

let checkInterval = 1000 * 60 * 5;
let filePrefix;
let checkHash = true;
let dataDir = './data';

function main() {
    setTimeout(main, checkInterval);
    console.log('Start :', new Date());
    getPreviousHash()
        .then((hash)=> {
            let previousHash = hash;


            downloadURL('http://slither.io/')
                .then((body)=> { //TODO error checking
                    let script = body.match(/\/s\/game.*\.js/) // search for the game js filename
                    if (!script && !script[0]) return;
                    script = script[0];
                    filePrefix = script.match(/(game.*)\.js/)[1];
                    console.log('File Prefix', filePrefix);
                    let scriptURL = 'http://slither.io' + script;
                    console.log('Script Url', scriptURL);
                    return scriptURL;
                })
                .then(downloadURL)
                .then((code)=> {
                    return beautify(code);
                })
                .then((code)=> {
                    let newHash = hashFromString(code)
                    console.log('    Current  Hash ', newHash);
                    console.log('    Previous Hash ', previousHash);
                    if (!checkHash || (newHash !== previousHash)) {
                        console.log('      --> Saving ...');
                        saveHash(newHash);
                        return saveFile(code);
                    } else {
                        console.log('    --> Nothing to do...');
                        return null;
                    }

                })
                .then((filename)=> {
                    if (filename) {
                        console.log('New Filename created :', filename)
                    }
                })

                .catch((err)=> {
                    console.log('Error : ', err)
                });

        })
}


function downloadURL(url) {
    return new Promise(function (resolve, reject) {
        Request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            }
        });
    });
}

function saveFile(code) {
    return new Promise(function (resolve, reject) {
        let dateStr = (new Date()).toISOString().slice(0, 19).replace(/[-:]/g, ".").replace(/T/g, "-");
        let newFilename = dateStr + '-' + filePrefix + '.js';
        var content = fs.writeFile(dataDir + '/' + newFilename, code, function (error) {
            if (error) {
                throw new Exception('Error while saving file' + newFilename + ':' + error);
            } else {
                console.log('File saved', newFilename);
                resolve(newFilename);
            }
        });
    });
}

function hashFromFile(fileName) {
    return new Promise(function (resolve, reject) {

        var fd = fs.createReadStream(fileName);
        var hash = crypto.createHash('sha1');
        hash.setEncoding('hex');

        fd.on('end', function () {
            hash.end();
            console.log(hash.read()); // the desired sha1sum
            resolve(hash.read());
        });

        // read all file and pipe it (write it) to the hash object
        fd.pipe(hash);
    });

}

function hashFromString(str) {
    var hash = crypto.createHash('sha1');
    // change to 'binary' if you want a binary hash.
    hash.setEncoding('hex');
    // the text that you want to hash
    hash.write(str);
    // very important! You cannot read from the stream until you have called end()
    hash.end();
    // and now you get the resulting hash
    var sha1sum = hash.read();
    return sha1sum;
}

function getPreviousHash() {
    return new Promise(function (resolve, reject) {
        fs.readFile(dataDir + '/hash.txt', 'utf8', function (err, contents) {
            resolve(contents);
        });
    });
}

function saveHash(hash) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(dataDir + '/hash.txt', hash, function (error) {
            if (error)throw new Error('Error while writing hash file', error);
        });
    });
}

main();
