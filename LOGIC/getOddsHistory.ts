import express from "express"
import { authenticateAdminRequest, getOdds } from "./feederUtility";





export const getOddsHistoryRoute = async(req:express.Request,res:express.Response) => {

    try {
        
        const admin: any = authenticateAdminRequest(req);
        if(!req.body.startDate || !req.body.endDate) throw {message:'Required Fields Missing!',code:400}

        let body = {
            marketId:req.body.marketId,
            matchId:req.body.matchId,
            startDate:req.body.startDate,
            endDate:req.body.endDate,
            feederId:req.body.feederId
        }

        let oddsList = await getOdds(body);
        
        res.status(200).json({oddsList:oddsList}) 
       
      }catch (err:any) {
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