import  express from "express"
import { authenticateAdminRequest, deleteCustomMarket, deleteCustomMarketInPanel } from "./feederUtility";




export const deleteCustomMarketRoute = async(req:express.Request,res:express.Response) => {

    try {

        const admin: any = authenticateAdminRequest(req);
    
        if (!req?.body?.marketId) throw { message: 'Please Provide required fields', code: 400 }
    
    
        await deleteCustomMarket(req?.body?.marketId);
    
        await deleteCustomMarketInPanel(req?.body?.marketId);
           
        res.status(200).json({ message: 'Market Deleted Successfully!', code: 201})
         
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








