
var request = require("request");
var http = require('http');
const express = require("express");
const app=express();
var ArrayList= require("arraylist");
var MultiMap = require("multimap");
var item;
var subItem;
var url = "https://jasonbase.com/things/LW3j/";
var positions;

/* PNL Calc Service, reads JSON from predefined URL and calculates Cash, PNL & Holdings from JSON transactions
 returns pnl details in JSON format*/
app.get('/pnl/calc',function(req, res){

  // call URL & get JSON transactions
request({
    url: url,
    json: true,
 }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        
        if(body!==null){
          positions=body;
        }
        else
        console.log(" Data is Null at "+url);

        var holdingsMap=null; var pnlDetailsList=new ArrayList();
          var buyMap=new MultiMap();
          var sellMap=new MultiMap();
          var totalPnl=0;
        var initialCash,currentCash=0;
        // Traverse JSON transactions and get required data
        for (parent in positions) {

          if(parent=='base')
          {
          
          for (child in positions[parent]) {

              // Read cash from Cash field under base
               if(child=='Cash'){
                initialCash,currentCash=positions[parent][child];
             }
             else if(child=='Holdings'){
               // Read holdings from Holdings field under base
             holdingsMap = new Map(Object.entries(positions[parent][child]));
             }
          }
          
          }
              
        
             else if(parent=='transactions'){
               // Loop through transactions and get each transaction details
               for (child in positions[parent]) {
                   
                var trade=positions[parent][child];

                  // If the trade type is buy handle buy side logic
                  if(trade.type=='Buy'){
                
                // MultiMap holds all buy transactions in the order of transactions
                 buyMap.set(trade.symbol,trade);
                 
                 // Buy side so Net Money is deducted from current cash
                 currentCash=currentCash-(trade.price*trade.amount);
                 // Adding current Quantity to holdings map for this security 
                 holdingsMap.set(trade.symbol,holdingsMap.get(trade.symbol)+trade.amount);
                 // Add this Transaction Pnl, Cash & holdings into a List
                 pnlDetailsList.add(new pnlDetails(totalPnl,currentCash,holdingsMap));
                 
               }
               // If the trade type is sell handle sell side logic
               else if(trade.type=='Sell')
               { 
                 // Substracting current Quantity to holdings map for this security 
                 holdingsMap.set(trade.symbol,(holdingsMap.get(trade.symbol))-trade.amount);

                 // Sell side so Net Money is added to current cash
                 
                 currentCash=currentCash+(trade.price*trade.amount)
                 
                 // Calculate Pnl on this sell trnsaction
                 totalPnl+=calculatePnL(buyMap,trade);

                 // // Add this Transaction Pnl, Cash & holdings into a List
                 pnlDetailsList.add(new pnlDetails(totalPnl,currentCash,holdingsMap));
                 
                
               }

               
                
                // console.log("Pnl of "+ totalPnl+ " Cash : "+currentCash);
                //  for (const [key, value] of holdingsMap){
                //      console.log(key+":"+value);
                //     }
                    
               }
               
                   
             }

}}

// Add JSON to response 
res.send(JSON.stringify(pnlDetailsList));
});

});



  /* Function calculates takes buySide Transaction Map and current transaction and returns pnl */
function calculatePnL(buyMap,trade){

    var pnl=0;
    
            buyMap.forEach(function (value, key) {
              
              var buyTrade=value;
              if(key==trade.symbol){
                
                /* Implement FIFO, if buy trade has equal or more quantity than current trade 
                then pnl is sell side netmoney minus trade side netmoney and deduct this trade quantity
                from the buy side transaction quantity.
                */
                if(buyTrade.amount>=trade.amount)
                {
                  pnl+=(trade.price*trade.amount-buyTrade.price*trade.amount);
                  buyTrade.amount=buyTrade.amount-trade.amount;
        
                }
                else{
                  /*else calculate pnl for the remaining quantity in this transaction and return, so that in the 
                  next next buy trade for this security remaining quantity can be used to calculate total pnl
                  */
                  pnl=((trade.price*buyTrade.amount)-(buyTrade.price*buyTrade.amount));
                    trade.amount=trade.amount-buyTrade.amount;
                    }
                    }
                })
                return pnl;
  }

  // pnl details 
var pnlDetails = function(pnl,cash,holdingsMap){
  var Holdings = new ArrayList;
  this.Cash = cash;
  this.Pnl = pnl;
  this.Holdings=Holdings;

  for (const [key, value] of holdingsMap){
      Holdings.add(new holding(key,value));
      }
   }
    // holding details
  var holding=function(symbol,amount)
  {
      this.symbol=symbol;
      this.amount=amount;
  }

  // Listen on port 8040 when we start this node
app.listen(8040, function(){
    console.log("Listening on 8040 port");
})