import express from "express"
import { authenticateAdminRequest, getCustomMarketBySequence, getCustomMarketForFeederPanel, updateCustomMarket, updateCustomMarketInPanel, updateCustomMarketSequence } from "./feederUtility";




export const updateCustomMarketRoute = async(req:express.Request,res:express.Response) => {

    try {

        const admin: any = authenticateAdminRequest(req);
    
        let dbMarket = await getCustomMarketForFeederPanel(null,null,req.body.marketId,null);
    
        if(dbMarket.length == 0) throw ({message:'Invalid market!',code:400});
    
        let existingSequenceNo = dbMarket[0].sequenceNo;
    
        let runners:any = [];
    
        let marketName = req.body.marketName;
    
        if(dbMarket[0].marketTypeId == 10){
        if (!req.body.marketName || !req?.body?.minBet || !req?.body?.maxBet || !req?.body?.marketSize || !req?.body?.marketId) throw { message: 'Please Provide required fields', code: 400 }
    
          marketName = dbMarket[0].marketName;
          runners = dbMarket[0].runners;
    
          if(req.body.showAfterMarketId){
    
              const existingMarkets = await getCustomMarketBySequence(dbMarket[0].refMatchId , 10,null,null);
              let fancyMarket = [];
    
              let seqChanged = false;
              for (let market of existingMarkets) {
                 let sequenceNo = market.sequenceNo;
    
                if(market.marketId == req.body.showAfterMarketId){
                  fancyMarket.push(market);
                  sequenceNo = sequenceNo +1;
    
                  if(sequenceNo!=existingSequenceNo){
                    seqChanged = true;
                    existingSequenceNo = sequenceNo;
                  }
                }
      
                if(seqChanged && market.marketId != req.body.showAfterMarketId ){
                  await updateCustomMarketSequence(market.marketId,market.sequenceNo+1);
                }
              }
          } 
    
        }else if(dbMarket[0].marketTypeId == 12){
        if (!req.body.runners || !req.body.marketName || !req?.body?.minBet || !req?.body?.maxBet || !req?.body?.marketSize || !req?.body?.marketId) throw { message: 'Please Provide required fields', code: 400 }
    
          marketName = 'Bookmaker';
          runners = req.body.runners;
        }
    
        let marketData = {
            marketId:req?.body?.marketId,
            minBet:req.body.minBet,
            maxBet:req.body.maxBet,
            marketSize:req.body.marketSize,
            runners:runners,
            marketName:marketName,
            sequenceNo:existingSequenceNo
        }
    
        await updateCustomMarket(marketData);
    
        await updateCustomMarketInPanel(marketData);
    
        res.status(200).json({ message: 'Market Updated Successfully!', code: 201})
         
      } catch (err:any) {
        if (err.code && err.code > 1) {
          res.status(err.code).json({
            statusCode: err.code, message: err.message ? err.message : err
          })
        } else {
          res.status(200).json({
            statusCode: err.code ? err.code : 500, message: err.message ? err.message : err
          })
        }
      }
}