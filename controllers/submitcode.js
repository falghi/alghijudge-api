const hackerEarth = require('hackerearth-node');
let hackerEarthApi = new hackerEarth(process.env.HACKER_EARTH_API_KEY, '');

numberOfCasesDict = {
    "TP-1 SDA 2019": 3
}

const handleSubmitCode = (fs) => (req, resp) => {
    const { problemName, code } = req.body;

    numberOfCases = numberOfCasesDict[problemName];

    let config = {};
    config.time_limit = 3;
    config.memory_limit = 323244;
    config.source = code;
    config.input = "";
    config.language = "JAVA";

    promises = []
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
                            config.input = inputData;
                            if (i === 0) {
                                hackerEarthApi.run(config, (err, response) => {
                                    if (err) {
                                        reject(new Error(err));
                                    } else {
                                        resolve({
                                            input: inputData,
                                            hasil: JSON.parse(response),
                                            output: outputData
                                        });
                                    }
                                });
                            } else {
                                promises[i-1].then(value => {
                                    hackerEarthApi.run(config, (err, response) => {
                                        if (err) {
                                            reject(new Error(err));
                                        } else {
                                            resolve({
                                                input: inputData,
                                                hasil: JSON.parse(response),
                                                output: outputData
                                            });
                                        }
                                    })
                                }).catch(error => {
                                    reject(new Error(error));
                                });
                            }
                        }
                    });
                }
            });
        });
    }

    promises[numberOfCases-1].then(values => {
        resp.json(values);
    }).catch(error => {
        resp.json("failed");
    });
}

module.exports = {
	handleSubmitCode: handleSubmitCode
}