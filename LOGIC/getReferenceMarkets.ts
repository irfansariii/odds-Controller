import express from "express"
import { authenticateUserRequest, getReferenceMarket } from "./feederUtility";




export const getReferenceMarketsRoute = async(req:express.Request,res:express.Response) => {

    try {

        if(!req.body.marketTypeId || !req.body.marketId || !req.body.matchId) throw ({message:'Provide required Fields!',code:400})
    
        let user = authenticateUserRequest(req);
    
            const marketList = await getReferenceMarket(req.body.marketTypeId,req.body.marketId,req.body.matchId);
          
            res.status(200).json({ message: 'Markets Fetched!',marketList })
           
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