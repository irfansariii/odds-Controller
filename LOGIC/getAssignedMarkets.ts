import express from "express"
import { getAssignedMarkets } from "./feederUtility";



export const getAssignedMarketsRoute = async(req:express.Request, res:express.Response) => {


    try {
        
        // const admin: any = authenticateAdminRequest(req);

        let payload = {
            refMatchId:req.body.matchId,
            refFeederMemberId:req.body.refFeederMemberId,
            marketId:req.body.marketId,
            marketTypeId:req.body.marketTypeId
        }

        let marketList = await getAssignedMarkets(payload);
    
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