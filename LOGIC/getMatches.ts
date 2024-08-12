import express from "express";
import { authenticateAdminRequest, getDbMatches } from "./feederUtility";



export const getMatchesRoute = async(req:express.Request,res:express.Response) => {

    try {
        
        const admin: any = authenticateAdminRequest(req);
        if(!req.body.tournamentId) throw {message:'Required Fields Missing!',code:400}


        let matchList = await getDbMatches(req.body.tournamentId);
        
        res.status(200).json({matchList:matchList})
       
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