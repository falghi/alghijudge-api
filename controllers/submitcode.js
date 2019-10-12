const {java} = require('compile-run');

numberOfCasesDict = {
    "TP-1 SDA 2019": 10,
    "TP-2 SDA 2019": 5
}

const handleSubmitCode = (fs) => (req, resp) => {
    let { problemName, code } = req.body;

    numberOfCases = numberOfCasesDict[problemName];

    let newClassName = makeid(10);
    let codePath = "user_codes/" + newClassName + ".java";
    while (fs.existsSync(codePath)) {
        newClassName = makeid(10);
        codePath = "user_codes/" + newClassName + ".java";
    }
    code = renameClass(code, newClassName);

    fs.writeFile(codePath, code, (writeError) => {
        if (writeError) {
            resp.json("failed");
            return;
        }
        let promises = [];
        for (let i = 0; i < numberOfCases; ++i) {
            promises[i] = new Promise((resolve, reject) => {
                fs.readFile(`static/${problemName}/in${i+1}`, 'utf8', (err, data) => {
                    if (err) {
                        reject(new Error(err));
                    } else {
                        let inputData = data;
                        fs.readFile(`static/${problemName}/out${i+1}`, 'utf8', (err, data) => {
                            if (err) {
                                reject(new Error(err));
                            } else {
                                let outputData = data;

                                if (i === 0) {
                                    java.runFile(codePath, {
                                        stdin: inputData,
                                        compileTimeout: 10000
                                    }, (err, result) => {
                                        if(err) {
                                            reject(new Error(err));
                                        }
                                        else{
                                            let isAccepted = "WA";
                                            if (outputData === result.stdout) {
                                                isAccepted = "AC";
                                            }
                                            resolve([{
                                                input: inputData,
                                                expectedOutput: outputData,
                                                programOutput: result,
                                                isAccepted: isAccepted
                                            }]);
                                        }
                                    });
                                } else {
                                    promises[i-1].then(value => {
                                        java.runFile(codePath, {
                                            stdin: inputData,
                                            compileTimeout: 10000
                                        }, (err, result) => {
                                            if(err) {
                                                reject(new Error(err));
                                            }
                                            else{
                                                let isAccepted = "WA";
                                                if (outputData === result.stdout) {
                                                    isAccepted = "AC";
                                                }
                                                if (inputData.length >= 100000) {
                                                    inputData = `https://raw.githubusercontent.com/darklordace/alghijudge-api/tree/master/static/${problemName}/in${i+1}`;
                                                }
                                                if (outputData.length >= 100000) {
                                                    outputData = `https://raw.githubusercontent.com/darklordace/alghijudge-api/tree/master/static/${problemName}/out${i+1}`;
                                                }
                                                if (result.stdout.length >= 100000) {
                                                    result.stdout = "The result is too large to display";
                                                }
                                                value.push({
                                                    input: inputData,
                                                    expectedOutput: outputData,
                                                    programOutput: result,
                                                    isAccepted: isAccepted
                                                });
                                                resolve(value);
                                            }
                                        });
                                    }).catch(err => {
                                        reject(err);
                                    });
                                }
                            }
                        });
                    }
                });
            });
        }

        promises[numberOfCases-1].then(values => {
            fs.unlinkSync(codePath);
            resp.json(values);
        }).catch(error => {
            fs.unlinkSync(codePath);
            resp.json("failed");
        });
    })
}

function renameClass(code, newClassName) {
    let targetSubstring = "public class ";
    for (let i = 0; i < code.length; ++i) {
        if (code.substring(i, targetSubstring.length+i) === targetSubstring) {
            let beforeCode = code.slice(0, i);
            let tempCode = code.slice(i, code.length);
            let afterCode = tempCode.slice(tempCode.search('{'), tempCode.length);
            code = beforeCode + "public class " + newClassName + " " + afterCode;
            break;
        }
    }
    return code;
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


module.exports = {
	handleSubmitCode: handleSubmitCode
}