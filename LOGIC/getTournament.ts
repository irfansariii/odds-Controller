import express from "express";
import { authenticateAdminRequest, getDbTournaments } from "./feederUtility";






export const getTournamentRoute = async(req:express.Request, res:express.Response) => {

    try {

        if(!req.body.sportId) throw {message:'Required Fields Missing!',code:400}
        
        const admin: any = authenticateAdminRequest(req);

        let tourList = await getDbTournaments(req.body.sportId);
            

        res.status(200).json({tourList:tourList})
        
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