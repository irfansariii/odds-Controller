import express from "express"
import { authenticateAdminRequest, deleteCustomMarketInPanel, getCustomMarketForFeederPanel, insertResult, triggerAdminPubSub } from "./feederUtility";




export const insertResultRoute = async (req:express.Request,res:express.Response) => {

    try {

        const admin: any = authenticateAdminRequest(req);
    
        if (!req.body ||!req?.body?.marketId||!req?.body?.selectionId||!req?.body?.selectionName) throw { message: 'Please Provide required fields', code: 400 }
    
    
        let body = {
            marketId:req.body.marketId,
            selectionId:req.body.selectionId,
            selectionName:req.body.selectionName,
        }
    
        const market = await getCustomMarketForFeederPanel(null,null,req.body.marketId,null);
    
        if(!market || market.length ==0) throw ({message:'No such market exists !',code:400})
    
        if(market[0].marketTypeId != 10){
          if(body.selectionId!=-999){
            let runners = market[0].runners;
      
            let selectionAvl = false;
            let selectionNameAvl = false;
      
            for(let rnr of runners){
                if(rnr.SelectionId == body.selectionId){
                    selectionAvl = true;
                }
                if(rnr.RunnerName == body.selectionName){
                    selectionNameAvl = true;
                }
            }
      
            if(!selectionNameAvl || !selectionAvl) throw ({message:'Invalid Result',code:400})
          }
        }
    
        await insertResult(body,market[0]);
    
        await deleteCustomMarketInPanel(req?.body?.marketId);
    
        await triggerAdminPubSub({message:'CUSTOM_MARKET_STATUS_CHANGED'})

        res.status(200).json({ message:'Result inserted successfully!'})
    
        
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