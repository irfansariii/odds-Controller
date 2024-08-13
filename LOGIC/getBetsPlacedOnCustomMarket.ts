import express from "express"
import { authenticateUserRequest, getBetsPlacedOnCustomMarket } from "./feederUtility";





export const getBetsPlacedOnCustomMarketRoute = async(req:express.Request,res:express.Response) => {

    try {
        
        let user = authenticateUserRequest(req);

        let marketId = req.body.marketId;

        let betList = await getBetsPlacedOnCustomMarket(marketId);
    
        res.status(200).json(betList)
       
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