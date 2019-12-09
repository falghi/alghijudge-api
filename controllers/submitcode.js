const {java} = require('compile-run');

numberOfCasesDict = {
    "TP-1 SDA 2019": 10,
    "TP-2 SDA 2019": 15,
    "TP-3 SDA 2019": 40,
    "TP-4 SDA 2019": 5,
}

const handleSubmitCode = (fs, submitRecord) => (req, resp) => {
    let { problemName, code } = req.body;

    numberOfCases = numberOfCasesDict[problemName];

    let newClassName = makeid(10);
    let codePath = "user_codes/" + newClassName + ".java";
    while (fs.existsSync(codePath)) {
        newClassName = makeid(10);
        codePath = "user_codes/" + newClassName + ".java";
    }
    code = renameClass(code, newClassName);

    submitRecord[newClassName] = {};
    submitRecord[newClassName]['finished'] = false;
    submitRecord[newClassName]['failed'] = false;
    submitRecord[newClassName]['result'] = [];
    submitRecord[newClassName]['failedmsg'] = "";
    resp.json({
        recordName: newClassName
    })

    if (code === "") {
        submitRecord[newClassName]['finished'] = true;
        submitRecord[newClassName]['failed'] = true;
        submitRecord[newClassName]['failedmsg'] = "Public class not found";
        return;
    }

    fs.writeFile(codePath, code, (writeError) => {
        if (writeError) {
            submitRecord[newClassName]['failed'] = true;
            submitRecord[newClassName]['failedmsg'] = "Cannot create a new file";
            return;
        }
        let promises = [];
        for (let i = 0; i < numberOfCases; ++i) {
            promises[i] = new Promise((resolve, reject) => {
                fs.readFile(`static/${problemName}/in${i+1}`, 'utf8', (err, data) => {
                    if (err) {
                        submitRecord[newClassName]['failedmsg'] = "Error reading test case";
                        reject(new Error(err));
                    } else {
                        let inputData = data;
                        fs.readFile(`static/${problemName}/out${i+1}`, 'utf8', (err, data) => {
                            if (err) {
                                submitRecord[newClassName]['failedmsg'] = "Error reading test case";
                                reject(new Error(err));
                            } else {
                                let outputData = data;

                                if (i === 0) {
                                    java.runFile(codePath, {
                                        stdin: inputData,
                                        compileTimeout: 10000
                                    }, (err, result) => {
                                        if(err) {
                                            submitRecord[newClassName]['failedmsg'] = "Error compiling/running the program";
                                            reject(new Error(err));
                                        }
                                        else{
                                            result.stdout = removeTrailing(result.stdout);
                                            outputData = removeTrailing(outputData);     
                                            inputData = removeTrailing(inputData);

                                            let isAccepted = "WA";
                                            if (result.exitCode === null || result.exitCode === 143) {
                                                isAccepted = "TLE";
                                            } else if (result.exitCode !== 0) {
                                                if (result.errorType === "run-time") {
                                                    if (result.stderr.includes("java.lang.OutOfMemoryError")) {
                                                        isAccepted = "MLE";
                                                    } else {
                                                        isAccepted = "RTE";
                                                    }
                                                } else {
                                                    isAccepted = "CE";
                                                }
                                            }
                                            if (outputData === result.stdout) {
                                                isAccepted = "AC";
                                            }
                                            if (inputData.length >= 100000) {
                                                inputData = `https://raw.githubusercontent.com/darklordace/alghijudge-api/master/static/${problemName}/in${i+1}`;
                                            }
                                            if (outputData.length >= 100000) {
                                                outputData = `https://raw.githubusercontent.com/darklordace/alghijudge-api/master/static/${problemName}/out${i+1}`;
                                            }
                                            if (result.stdout.length >= 100000) {
                                                result.stdout = "The result is too large to display";
                                            }
                                            submitRecord[newClassName]['result'].push({
                                                input: inputData,
                                                expectedOutput: outputData,
                                                programOutput: result,
                                                isAccepted: isAccepted
                                            });
                                            resolve(i);
                                        }
                                    });
                                } else {
                                    promises[i-1].then(value => {
                                        java.runFile(codePath, {
                                            stdin: inputData,
                                            compileTimeout: 10000
                                        }, (err, result) => {
                                            if(err) {
                                                submitRecord[newClassName]['failedmsg'] = "Error compiling/running the program";
                                                reject(new Error(err));
                                            }
                                            else{
                                                result.stdout = removeTrailing(result.stdout);
                                                outputData = removeTrailing(outputData);     
                                                inputData = removeTrailing(inputData);

                                                let isAccepted = "WA";
                                                if (result.exitCode === null || result.exitCode === 143) {
                                                    isAccepted = "TLE";
                                                } else if (result.exitCode !== 0) {
                                                    if (result.errorType === "run-time") {
                                                        if (result.stderr.includes("java.lang.OutOfMemoryError")) {
                                                            isAccepted = "MLE";
                                                        } else {
                                                            isAccepted = "RTE";
                                                        }
                                                    } else {
                                                        isAccepted = "CE";
                                                    }
                                                }
                                                if (outputData === result.stdout) {
                                                    isAccepted = "AC";
                                                }
                                                if (outputData === result.stdout) {
                                                    isAccepted = "AC";
                                                }
                                                if (inputData.length >= 100000) {
                                                    inputData = `https://raw.githubusercontent.com/darklordace/alghijudge-api/master/static/${problemName}/in${i+1}`;
                                                }
                                                if (outputData.length >= 100000) {
                                                    outputData = `https://raw.githubusercontent.com/darklordace/alghijudge-api/master/static/${problemName}/out${i+1}`;
                                                }
                                                if (result.stdout.length >= 100000) {
                                                    result.stdout = "The result is too large to display";
                                                }
                                                submitRecord[newClassName]['result'].push({
                                                    input: inputData,
                                                    expectedOutput: outputData,
                                                    programOutput: result,
                                                    isAccepted: isAccepted
                                                });
                                                resolve(i);
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
            submitRecord[newClassName]['finished'] = true;
            setTimeout(() => {
                delete submitRecord[newClassNameName];
            }, 30000);
        }).catch(error => {
            fs.unlinkSync(codePath);
            if (!(failedmsg in submitRecord[newClassName]))
                submitRecord[newClassName]['failedmsg'] = "Unknown error occured";
            submitRecord[newClassName]['failed'] = true;
            submitRecord[newClassName]['finished'] = true;
            setTimeout(() => {
                delete submitRecord[newClassNameName];
            }, 30000);
        });
    })
}

function renameClassUtil(code, newClassName, targetSubstring) {
    let newCode = "";
    for (let i = 0; i < code.length; ++i) {
        if (code.substring(i, targetSubstring.length+i) === targetSubstring) {
            let beforeCode = code.slice(0, i);
            let tempCode = code.slice(i, code.length);
            let afterCode = tempCode.slice(tempCode.search('{'), tempCode.length);
            newCode = beforeCode + targetSubstring + newClassName + " " + afterCode;
            break;
        }
    }
    return newCode;
}

function renameClass(code, newClassName) {
    let newCode = renameClassUtil(code, newClassName, "\r\npublic class ");
    if (newCode === "")
        newCode = renameClassUtil(code, newClassName, "\npublic class ");
    if (newCode === "")
        newCode = renameClassUtil(code, newClassName, "\rpublic class ");
    if (newCode === "")
        newCode = renameClassUtil(code, newClassName, "public class ");
    return newCode
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

function removeTrailing(text) {
    let result = text.split('\r\n').map(x => x.trim()).join('\n');
    result = result.split('\n').map(x => x.trim()).join('\n');
    result = result.split('\r').map(x => x.trim()).join('\n');
    return result;
}

module.exports = {
	handleSubmitCode: handleSubmitCode
}