numberOfCasesDict = {
    "TP-1 SDA 2019": 3
}

const handleSubmitCode = (fs, hackerEarthApi) => (req, resp) => {
    const { problemName, code } = req.body;

    let config = {};
    config.time_limit = 3;
    config.memory_limit = 323244;
    config.source = code;
    config.input = "";
    config.language = "JAVA";

    numberOfCases = numberOfCasesDict[problemName];
    promises = []
    hackerEarthApi.compile(config, (err, compileResp) => {
        if (err) {
            resp.json("failed");
        } else {
            for (let i = 0; i < numberOfCases; ++i) {
                promises[i] = new Promise((resolve, reject) => {
                    fs.readFile(`static/${problemName}_in${i+1}`, 'utf8', (err, data) => {
                        if (err) {
                            reject(new Error('failed'));
                        } else {
                            let inputData = data;
                            fs.readFile(`static/${problemName}_out${i+1}`, 'utf8', (err, data) => {
                                if (err) {
                                    reject(new Error('failed'));
                                } else {
                                    let outputData = data;
                                    config.input = inputData;
                                    hackerEarthApi.run(config, (err, response) => {
                                        if (err) {
                                            reject(new Error('failed'));
                                        } else {
                                            resolve({
                                                input: inputData,
                                                hasil: JSON.parse(response),
                                                output: outputData
                                            });
                                        }
                                    })
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
        }
    });
}

module.exports = {
	handleSubmitCode: handleSubmitCode
}