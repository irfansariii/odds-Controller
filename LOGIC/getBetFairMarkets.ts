import express from "express" 
import { authenticateAdminRequest, getBetfairrMarket } from "./feederUtility";




export const getBetFairMarketsRoute = async(req:express.Request,res:express.Response) => {

    try {
        
        const admin: any = authenticateAdminRequest(req);

        let matchId = req.body.matchId;
        let marketTypeId = req.body.marketTypeId;
        let marketId = req.body.marketId;

        let marketList = await getBetfairrMarket(matchId,marketTypeId,marketId,null);

        res.status(200).json(marketList)
       
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