 import express from "express"
import { authenticateUserRequest, insertOdds } from "./feederUtility";



 export const insertOddsRoute = async(req:express.Request,res:express.Response) => {

    try {

        let user = authenticateUserRequest(req);
    
        // if (!req.body ||!req?.body?.bmi || !req?.body?.ip || !req?.body?.mi || !req?.body?.ms
        //     || !req?.body?.eid || !req.body.rt) throw { message: 'Please Provide required fields', code: 400 }
    
    
        // for(let odd of req.body.rt){
        //     if(odd.ri == undefined || odd.rt == undefined || odd.bv == undefined 
        //         || odd.ib == undefined || odd.pt == undefined || typeof(odd.ib)!='boolean' || typeof(odd.ri)!='string'){
        //             throw { message: 'Invalid odd', code: 400 }
        //     }
        // }
    
        let body = {
            bmi:req.body.bmi,
            ip:req.body.ip,
            mi:req.body.mi,
            ms:req.body.ms,
            eid:req.body.eid,
            rt:req.body.rt,
            feederMemberId:user.feederMemberId,
            ipAddress:req.body.ipAddress
        }
    
        // await insertOdds(body,user.feederMemberId);
    
        await insertOdds(req.body.odds.data[0],user.feederMemberId);
    
        res.status(200).json({ message: 'Odds inserted Successfully!', code: 201})
        
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