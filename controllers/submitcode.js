const handleSubmitCode = (fs, hackerEarthApi) => (req, resp) => {
    const { problemName, code } = req.body;

    let config = {};
    config.time_limit = 1;
    config.memory_limit = 323244;
    config.source = code;
    config.input = "";
    config.language = "JAVA";

    hackerEarthApi.compile(config, (err, compileRes) => {
        if (err) {
            resp.json("failed");
        } else {
            // Test Case 1
            fs.readFile("static/in1", 'utf8', (err, data) => {
                if (err) {
                    resp.json(err);
                } else {
                    let inputData = data;
                    fs.readFile("static/out1", 'utf8', (err, data) => {
                        if (err) {
                            resp.json("failed");
                        } else {
                            let outputData = data;
                            config.input = inputData;
                            hackerEarthApi.run(config, (err, response) => {
                                if (err) {
                                    resp.json("failed");
                                } else {
                                    resp.json({
                                        hasil: response,
                                        output: outputData
                                    });
                                }
                            })
                        }
                    });
                }
            });
        }
    });
}

module.exports = {
	handleSubmitCode: handleSubmitCode
}