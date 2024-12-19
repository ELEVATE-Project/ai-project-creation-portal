const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 1820;

app.use('/create-project', express.static(path.join(__dirname, 'build')));

app.get('/create-project/*', (req, res) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
