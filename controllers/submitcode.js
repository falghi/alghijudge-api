const hackerEarth = require('hackerearth-node');
let hackerEarthApi = new hackerEarth(process.env.HACKER_EARTH_API_KEY, '');

numberOfCasesDict = {
    "TP-1 SDA 2019": 3
}

const handleSubmitCode = (fs) => (req, resp) => {
    const { problemName, code } = req.body;

    numberOfCases = numberOfCasesDict[problemName];

    let configList = [];
    let promises = [];
    for (let i = 0; i < numberOfCases; ++i) {
        configList[i] = {}
        configList[i].time_limit = 3;
        configList[i].memory_limit = 323244;
        configList[i].source = code;
        configList[i].input = "";
        configList[i].language = "JAVA";

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
                            configList[i].input = inputData;
                            if (i === 0) {
                                hackerEarthApi.run(configList[i], (err, response) => {
                                    if (err) {
                                        reject(new Error(err));
                                    } else {
                                        resolve([{
                                            input: inputData,
                                            hasil: JSON.parse(response),
                                            output: outputData
                                        }]);
                                    }
                                });
                            } else {
                                promises[i-1].then(value => {
                                    hackerEarthApi.run(configList[i], (err, response) => {
                                        if (err) {
                                            reject(new Error(err));
                                        } else {
                                            value.push({
                                                input: inputData,
                                                hasil: JSON.parse(response),
                                                output: outputData
                                            })
                                            resolve(value);
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