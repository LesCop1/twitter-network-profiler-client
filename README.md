# TNP Client
> **This is the Client of TNP.**
> 
[Demo](https://tnp.mathisengels.fr)

## TNP - Twitter Network Profiler
Twitter Network Profiler is a web app allowing you to see the relations around your target's Twitter account. It allows you, to see up to relations of depth 3, therefore a more global view around your target and learn more information about them. You have a lot of information on each found account, even their Instagram if available. 

## The Client
This repository is only the client which is the web application. The web app can't work without the server so you will have to install and run the TNP Server too.

### Demo
You can access the demo [here](https://tnp.mathisengels.fr).

## Prerequisites
Before you begin, ensure you have met the following requirements:
- You have installed Node (LTS version). You can check if you have Node installed by typing:
```bash
$ node --version
v16.13.0
```

## Configuration
You only need to configure the `config.js` with the right `BACKEND_URL` pointing to the TNP Server.

## Usage
To use the TNP on your local machine, you can either :
- Build the web app 
- Run in development mode

### Building the app
Run `npm run build` and get the production-ready app in the `build` folder.\
Now, you can just click the `index.html` and voilà.

### Run in development mode
Simply `npm start` and open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Credits
Made by [ENGELS Mathis](https://github.com/MathisEngels) and [BAUDUIN Thomas](https://github.com/radikaric) for the last year of our master's degree.