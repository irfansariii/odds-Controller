import express from "express"
import { authenticateAdminRequest, getResultForFeederPanel } from "./feederUtility";



export const getResultForFeederPanelRoute = async(req:express.Request,res:express.Response) => {

    try {
        
        const admin: any = authenticateAdminRequest(req);
        
        let resultObj = {
            marketId:req.body.marketId,
            matchId:req.body.matchId,
            tournamentId:req.body.tournamentId
        }

        let resultList = await getResultForFeederPanel(resultObj);
          
        res.status(200).json({resultList:resultList})
        
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