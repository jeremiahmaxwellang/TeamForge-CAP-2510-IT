### Installation

* Download ZIP of main branch on GitHub
* Extract to desired folder (ex: C:\Users\Me\Downloads)
* On command prompt, change directory to the path of the project folder. Example command below:
```
cd Downloads/TeamForge-CAP-2510-IT
``` 

* Use the package manager [npm] to initialize the folder as a NodeJS project.

```
npm init -y
```

* Use [npm] to install the required Node libraries
```
npm install express dotenv hbs path express-fileupload express-session cookie-parser nodemailer
```

### Executing program

* Go to command prompt
* Change directory to the path of the project folder. Example command below:
```
cd Downloads/TeamForge-CAP-2510-IT
```

* Run the Node Server
```
node src/index.js
```

* On your browser, enter the URL "localhost:3000" to access the homepage
```
localhost:3000
```