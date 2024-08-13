import express from "express"
import { authenticateAdminRequest, getDbMarkets } from "./feederUtility";




export const getMarketRoute = async (req:express.Request,res:express.Response) => {

    try {
        
        const admin: any = authenticateAdminRequest(req);
        if(!req.body.matchId) throw {message:'Required Fields Missing!',code:400}


        let marketList = await getDbMarkets(req.body.matchId);
            
        res.status(200).json({matchList:marketList})
        
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