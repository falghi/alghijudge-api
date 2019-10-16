const handleCheckSubmit = (submitRecord) => (req, resp) => {
    let { recordName } = req.body;

    resp.json(submitRecord[recordName]);
}

module.exports = {
	handleCheckSubmit: handleCheckSubmit
}