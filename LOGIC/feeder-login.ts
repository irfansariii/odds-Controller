import express from "express";
import { getFeederByFeederUsername } from "./feederUtility";
import { jwtkey } from "../CONFIG/environment";

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


export const feederloginRoute = async(req:express.Request, res:express.Response) => {

    try {
        if (!req?.body?.feederMemberUsername || !req?.body?.feederMemberPassword) {
          throw { message: 'Please provide username/password', code: 400 }
        }
    
        const member = await getFeederByFeederUsername(req.body.feederMemberUsername);
    
        if(!member) throw {message:"Username does not exist!",code:400}
    
        // const roleList =  await getAccessListByRoleId(member.feederRoleId)
    
        if (bcrypt.compareSync(req?.body?.feederMemberPassword, member.feederMemberPassword)) {
        } else {
          throw { message: 'Invalid password', code: 401 }
        }
    
        delete member['feederMemberPassword']
    
    
        let token = jwt.sign(
          {
            account: 'DEFAULT',
            tokenType: 'ACCESS',
            user: member,
          },
          Buffer.from(jwtkey, 'base64'),
          {
            expiresIn: '10h',
            algorithm: 'HS512',
            issuer: 'Junglee',
            audience: 'Junglee',
          }
        )
        res.status(200).json({ token: token,member:member})
       
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