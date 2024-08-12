import { DB_NAME, DB_PASSWORD, DB_SERVER, DB_USER, jwtkey } from "../CONFIG/environment"


export const sqlConfig = {
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    server: DB_SERVER,
    connectionTimeout: 30000,
    requestTimeout: 60000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    authentication: {
        type: 'default'
    },
    options: {
      encrypt: true,
      trustServerCertificate: true
    },
  }

  const jwt = require('jsonwebtoken')

const sql = require('mssql')



export const getFeederByFeederUsername = async(feederMemberUsername)=>{
    try{
      let pool = await sql.connect(sqlConfig)
      let query = await pool
      .request()
      .input('feederMemberUsername', feederMemberUsername)
      .query(`SELECT feederMemberId,feederMemberUsername,feederMemberPassword,feederRoleId FROM feederMembers WHERE [feederMemberUsername] = @feederMemberUsername`)
  
    const feederMember = query.recordset[0]
  
    return Promise.resolve(feederMember)
  
    }catch(error){
      console.error('rejecting getFeederByFeederUsername')
      console.error(error)
      throw (error)
    }
  }
// NEED TO DISCUSS

  export const authenticateAdminRequest = (req:any):any=>{

    let token: string | null = null;

    if(!req.headers.authorization){
      throw {message:"Login Required !",code:401}
    }
  
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1];
    } 
      if (!token) {
    throw { message: "Invalid Token", code: 401 };
  }

    try{
      jwt.verify(token, Buffer.from(jwtkey, 'base64'));
      // console.log(isTokenVerified);
      const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      // console.log(decodedToken)
  
      if(decodedToken.user.feederRoleId!= 1) throw { message: 'User Not Authorized!', code: 400 }
  
      return decodedToken.user
    }catch(err){
      console.log("invalid token")
      throw {message:"Invaid Token",code:401}
    }
    
  }

  export const getDbSports = async()=>{
    try{
  
      let pool = await sql.connect(sqlConfig)
      let sportQuery = await pool
      .request()
      .query(`select * from betfairSports`);
  
      let sportList = sportQuery.recordset;
      
      return Promise.resolve(sportList)
  
    }catch(error){
      throw error;
    }
  }

  export const getAllFeeder = async()=>{
    try{
      let pool = await sql.connect(sqlConfig)
      let query = await pool
      .request()
      .query(`SELECT feederMemberId,feederMemberUsername,feederMemberPassword,feederRoleId,createdDateTime FROM feederMembers WHERE feederRoleId=2`)
  
    const feederMember = query.recordset;
  
    return Promise.resolve(feederMember)
  
    }catch(error){
      console.error('rejecting getAllFeeder')
      console.error(error)
      throw (error)
    }
  }
  export const getCustomMarketForFeederPanel = async(matchId,typeId,marketId,centralId)=>{
    try{
  
      let pool = await sql.connect(sqlConfig)
        const marketQuery = await pool
        .request()
        .input('refMatchId', matchId)
        .input('marketTypeId', typeId)
        .input('marketId', marketId)
        .input('refCentralId', centralId)
        .query(`select marketId,refMatchId,refMatchName,refTournamentId,refTournamentName,createDateTime,
          refSportId,refSportName,marketName,marketTime,marketType,runners,marketTypeId,refCentralId,
          lastMarketRate,isCustomMarket,customMinBet,customMaxBet,customDelay,customMarketSize, sequenceNo from 
          customMarkets
          WHERE (@marketTypeId IS NULL OR marketTypeId = @marketTypeId)
          AND isResultDeclared=0
          AND (@marketId IS NULL OR marketId = @marketId)
          AND (@refCentralId IS NULL OR refCentralId = @refCentralId) 
          AND (@refMatchId IS NULL OR refMatchId = @refMatchId) ORDER BY customMarketsId desc`)
  
        const marketList = marketQuery.recordset;
  
        for(let market of marketList){
          market.runners = JSON.parse(market.runners)
        }
  
        return Promise.resolve(marketList);
  
    }catch(error){
      console.error('rejecting getCustomMarketForFeederPanel.')
      console.error(error)
      throw (error)
    }
  }
  
export const getResultForFeederPanel = async(resultObj)=>{
  try{

    let pool = await sql.connect(sqlConfig)
    let resultQuery =  await pool
      .request()
      .input('marketId', resultObj.marketId)
      .input('matchId', resultObj.matchId)
      .input('tournamentId', resultObj.tournamentId)
      .query(`select selectionId,selectionName,matchName,sportName,marketName,tournamentName,createdDateTime from resultMaster where 
      (@marketId IS NULL OR marketId = @marketId)
      AND (@matchId IS NULL OR matchId = @matchId)
      AND (@tournamentId IS NULL OR tournamentId = @tournamentId) `);
    
    const result = resultQuery.recordset;

    return Promise.resolve(result)

  }catch(error){
    return error
  }
}
export const getDbTournaments = async(refSportId)=>{
  try{

    let pool = await sql.connect(sqlConfig)
    let tourQuery = await pool
    .request()
    .input('refSportId',refSportId)
    .query(`select * from betfairTournaments where refSportId=@refSportId`);

    let tourList = tourQuery.recordset;
    
    return Promise.resolve(tourList)

  }catch(error){
    throw error;
  }
}
export const getDbMatches = async(refTournamentId)=>{
  try{

    let pool = await sql.connect(sqlConfig)
    let matchQuery = await pool
    .request()
    .input('refTournamentId',refTournamentId)
    .query(`select * from betfairMatches where refTournamentId=@refTournamentId`);

    let matchList = matchQuery.recordset;
    
    return Promise.resolve(matchList)

  }catch(error){
    throw error;
  }
}
export const getAssignedMarkets = async(body)=>{
  try{

    let pool = await sql.connect(sqlConfig)
    const assignQuery = await pool
    .request()
    .input('marketId', body.marketId)
    .input('refMatchId', body.refMatchId)
    .input('refFeederMemberId', body.refFeederMemberId)
    .query(`select fma.feederMarketAssignmentId, fma.refMarketId,fma.refFeederMemberId,fma.marketTypeId,fm.feederMemberUsername,
    cm.refMatchName,cm.marketName,fma.createdDateTime,cm.refMatchId,cm.refCentralId
    from feederMarketAssignment fma INNER JOIN feederMembers fm ON fma.refFeederMemberId=fm.feederMemberId
    INNER JOIN customMarkets cm ON cm.marketId=fma.refMarketId
    WHERE (@refFeederMemberId IS NULL OR refFeederMemberId = @refFeederMemberId)
    AND cm.isResultDeclared=0
    AND (@marketId IS NULL OR fma.refMarketId = @marketId) 
    AND (@refMatchId IS NULL OR cm.refMatchId = @refMatchId); `);


    const assignedMarkets = assignQuery.recordset;

    return Promise.resolve(assignedMarkets);
  }catch(error){
    throw error;
  }
}
export const getOdds = async(body)=>{
  try{

    let pool = await sql.connect(sqlConfig)
    let oddQuery =  await pool
      .request()
      .input('bmi', body.marketId)
      .input('eid', body.matchId)
      .input('startDate',new Date(body.startDate).toISOString())
      .input('endDate', new Date(body.endDate).toISOString())
      .input('feederId', body.feederId)
      .query(`select bmi,ip,mi,ms,eid,rt,cm.createdDateTime,feederMemberUsername,marketName,matchName,ipAddress,runners from customOddsMaster cm INNER JOIN feederMembers fm
      ON cm.feederId = fm.feederMemberId
      where 
      (@bmi IS NULL OR bmi = @bmi)
      AND (@eid IS NULL OR eid = @eid)
      AND (@feederId IS NULL OR feederId = @feederId)
      AND cm.createdDateTime BETWEEN @startDate AND @endDate
      order by customOddsMasterId desc`)

      const oddsList = oddQuery.recordset;

      for(let odd of oddsList){
        odd.rt = JSON.parse(odd.rt)
        odd.runners = JSON.parse(odd.runners)
      }

    return Promise.resolve(oddsList)

  }catch(error){
    throw error
  }
}