import exp from "constants"
import express from "express"
import { createFeederMember, getFeederByFeederUsername } from "./feederUtility";





export const createFeederMemberRoute = async(req:express.Request,res:express.Response) => {

    try {

        if(!req.body.feederMemberUsername || !req.body.feederMemberPassword) throw {message:"Required Fields missing",code:400}
        
        const member = await getFeederByFeederUsername(req.body.feederMemberUsername);
    
        if(member) throw {message:"Username already exists!",code:400}
    
        await createFeederMember(req.body.feederMemberUsername,req.body.feederMemberPassword)
    
        res.status(200).json({ message: 'user created successfully!', code: 201 })
        
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