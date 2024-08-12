import express from "express"
import { authenticateAdminRequest, getDbSports } from "./feederUtility";



export const getSportsRoute = async(req:express.Request, res:express.Response) => {

    try {
        
        const admin: any = authenticateAdminRequest(req);

        let sportList = await getDbSports();
           
        res.status(200).json({sportList:sportList})
       
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