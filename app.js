const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("TEAMFORGEE");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// function sayHello(name) {
//     console.log('Hello' + name);
// }

// sayHello(' World!');