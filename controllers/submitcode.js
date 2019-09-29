numberOfCasesDict = {
    "TP-1 SDA 2019": 3
}

const handleSubmitCode = (fs) => (req, resp) => {
    let {java} = require('compile-run');

    let { problemName, code } = req.body;

    numberOfCases = numberOfCasesDict[problemName];

    let newClassName = makeid(10);
    let codePath = "user_codes/" + newClassName + ".java";
    while (fs.existsSync(codePath)) {
        newClassName = makeid(10);
        codePath = newClassName + ".java";
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
                fs.readFile(`static/${problemName}_in${i+1}`, 'utf8', (err, data) => {
                    if (err) {
                        reject(new Error(err));
                    } else {
                        let inputData = data;
                        fs.readFile(`static/${problemName}_out${i+1}`, 'utf8', (err, data) => {
                            if (err) {
                                reject(new Error(err));
                            } else {
                                let outputData = data;
                                java.runFile(codePath, {
                                    stdin: inputData,
                                    compileTimeout: 10000
                                }, (err, result) => {
                                    if(err) {
                                        reject(new Error(err));
                                    }
                                    else{
                                        resolve({
                                            input: inputData,
                                            expectedOutput: outputData,
                                            programOutput: result
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }

        Promise.all(promises).then(values => {
            resp.json(values);
        }).catch(error => {
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