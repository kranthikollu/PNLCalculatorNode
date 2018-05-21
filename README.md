# PNLCalculatorNode
NodeJS based service API for calculating PNL, cash and holdings. This service doesnt take any input but reads json from predefined URL and returns calculated Pnl details

Install & Build

1) Download NODEJS - https://nodejs.org/en/download/
2) Use any IDE ( I used Visual Source Code), create Folder ( PNLCalculator) to workspace 
    click on view ---> integrated terminal --> cd to current project folder
3) install nodejs ( npm install nodejs)
4) Copy pnlCalculator.js from github into the folder
5) npm install http, request, express, arrayList, multimap
6) start server from terminal (node .\pnlCalculator.js)
7) server is listening on 8040 port
8) to test this, go to browser and enter this URL http://localhost:8040/pnl/calc
9) You will see PNL details for the JSON transactions at the URL https://jasonbase.com/things/LW3j/
