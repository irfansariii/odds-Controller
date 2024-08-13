import express from "express"
import { assignMarketToFeeder, authenticateAdminRequest, generateCentralId, getCustomMarketBySequence, saveCustomMarket, saveCustomMarketInPanel, updateCustomMarketSequence } from "./feederUtility";




export const saveCustomMarketWithManualEntryRoute = async(req:express.Request,res:express.Response) => {

    try {

        const admin: any = authenticateAdminRequest(req);
    
        if (!req.body || !req?.body?.matchId || !req?.body?.matchName || !req?.body?.tournamentId 
            || !req?.body?.tournamentName || !req?.body?.sportId || !req?.body?.sportName
            || !req?.body?.runners || !req?.body?.marketTypeId || (req?.body?.minBet == undefined) 
            || (req?.body?.maxBet == undefined) || !req?.body?.marketName
            || (req?.body?.marketSize==undefined) || (req?.body?.feederMemberId==undefined) ) throw { message: 'Please Provide required fields', code: 400 }
          
        let uniqueMarketId = crypto.randomUUID();
        let sequenceNo = 1;
    
        let runners = req?.body?.runners;
        let delay = 0;
     
        let marketType = null;
        let marketName = null;
    
        if(req?.body?.marketTypeId == 12){
            marketType = 'Bookmaker';
            marketName = 'Bookmaker';
            delay = 0;
        }else if(req?.body?.marketTypeId == 10){
          if(req.body.showAfterMarketId){
            const existingMarkets = await getCustomMarketBySequence(req?.body?.matchId , 10,null,null);
            let fancyMarket = [];
            
            let seqChanged = false;
            for (let market of existingMarkets) {
               sequenceNo = market.sequenceNo;
              if(market.marketId == req.body.showAfterMarketId){
                fancyMarket.push(market);
                sequenceNo = sequenceNo +1 ;
                seqChanged = true;
              }
    
              if(seqChanged && market.marketId != req.body.showAfterMarketId ){
                await updateCustomMarketSequence(market.marketId,market.sequenceNo+1);
              }
            }
          } 
            marketType = 'Fancy';
            delay = 0;
            marketName = req?.body?.marketName;
            runners = [{
              SelectionId: null,
              RunnerName: "The Bet",
              Handicap: 0
          }]
        }else{
            throw ({message:'Invalid Market',code:400})
        }
    
    
        let num=1;
    
        for(let runner of runners){
            if(!runner.RunnerName) throw ({message:'Invalid market runner!',code:400})
            runner.SelectionId = generateCentralId()+num;
            num++;
        }
          
        let marketData = {
            sequenceNo: sequenceNo,
            matchId: req?.body?.matchId,
            matchName: req?.body?.matchName,
            tournamentId: req?.body?.tournamentId,
            tournamentName: req?.body?.tournamentName,
            sportId: req?.body?.sportId,
            sportName: req?.body?.sportName,
            runners: runners,
            marketId:uniqueMarketId,
            minBet:req.body.minBet,
            maxBet:req.body.maxBet,
            delay:delay,
            marketSize:req.body.marketSize,
            marketTypeId:req?.body?.marketTypeId,
            marketType:marketType,
            marketName:marketName,
            centralId:generateCentralId(),
            feederMemberId:req.body.feederMemberId
        }
    
        await saveCustomMarket(marketData,admin.feederMemberId);
    
        await saveCustomMarketInPanel(marketData);
    
        let payload = {
          feederMemberId:req.body.feederMemberId,
          marketId:uniqueMarketId,
          marketTypeId:req.body.marketTypeId
        }
      
        await assignMarketToFeeder(payload)
    
        res.status(200).json({ message: 'Market Saved Successfully!', code: 201})
          
        
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