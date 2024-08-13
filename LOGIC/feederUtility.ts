import { DB_NAME, DB_PASSWORD, DB_SERVER, DB_USER, jwtkey } from "../CONFIG/environment"
import axios from "axios"

var bcrypt = require('bcryptjs')
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



export const getFeederByFeederUsername = async (feederMemberUsername) => {
  try {
    let pool = await sql.connect(sqlConfig)
    let query = await pool
      .request()
      .input('feederMemberUsername', feederMemberUsername)
      .query(`SELECT feederMemberId,feederMemberUsername,feederMemberPassword,feederRoleId FROM feederMembers WHERE [feederMemberUsername] = @feederMemberUsername`)

    const feederMember = query.recordset[0]

    return Promise.resolve(feederMember)

  } catch (error) {
    console.error('rejecting getFeederByFeederUsername')
    console.error(error)
    throw (error)
  }
}
// NEED TO DISCUSS

export const authenticateAdminRequest = (req: any): any => {

  let token: string | null = null;

  if (!req.headers.authorization) {
    throw { message: "Login Required !", code: 401 }
  }

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    throw { message: "Invalid Token", code: 401 };
  }

  try {
    jwt.verify(token, Buffer.from(jwtkey, 'base64'));
    // console.log(isTokenVerified);
    const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    // console.log(decodedToken)

    if (decodedToken.user.feederRoleId != 1) throw { message: 'User Not Authorized!', code: 400 }

    return decodedToken.user
  } catch (err) {
    console.log("invalid token")
    throw { message: "Invaid Token", code: 401 }
  }

}

export const getDbSports = async () => {
  try {

    let pool = await sql.connect(sqlConfig)
    let sportQuery = await pool
      .request()
      .query(`select * from betfairSports`);

    let sportList = sportQuery.recordset;

    return Promise.resolve(sportList)

  } catch (error) {
    throw error;
  }
}

export const getAllFeeder = async () => {
  try {
    let pool = await sql.connect(sqlConfig)
    let query = await pool
      .request()
      .query(`SELECT feederMemberId,feederMemberUsername,feederMemberPassword,feederRoleId,createdDateTime FROM feederMembers WHERE feederRoleId=2`)

    const feederMember = query.recordset;

    return Promise.resolve(feederMember)

  } catch (error) {
    console.error('rejecting getAllFeeder')
    console.error(error)
    throw (error)
  }
}
export const getCustomMarketForFeederPanel = async (matchId, typeId, marketId, centralId) => {
  try {

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

    for (let market of marketList) {
      market.runners = JSON.parse(market.runners)
    }

    return Promise.resolve(marketList);

  } catch (error) {
    console.error('rejecting getCustomMarketForFeederPanel.')
    console.error(error)
    throw (error)
  }
}

export const getResultForFeederPanel = async (resultObj) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let resultQuery = await pool
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

  } catch (error) {
    return error
  }
}
export const getDbTournaments = async (refSportId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let tourQuery = await pool
      .request()
      .input('refSportId', refSportId)
      .query(`select * from betfairTournaments where refSportId=@refSportId`);

    let tourList = tourQuery.recordset;

    return Promise.resolve(tourList)

  } catch (error) {
    throw error;
  }
}
export const getDbMatches = async (refTournamentId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let matchQuery = await pool
      .request()
      .input('refTournamentId', refTournamentId)
      .query(`select * from betfairMatches where refTournamentId=@refTournamentId`);

    let matchList = matchQuery.recordset;

    return Promise.resolve(matchList)

  } catch (error) {
    throw error;
  }
}
export const getAssignedMarkets = async (body) => {
  try {

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
  } catch (error) {
    throw error;
  }
}
export const getOdds = async (body) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let oddQuery = await pool
      .request()
      .input('bmi', body.marketId)
      .input('eid', body.matchId)
      .input('startDate', new Date(body.startDate).toISOString())
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

    for (let odd of oddsList) {
      odd.rt = JSON.parse(odd.rt)
      odd.runners = JSON.parse(odd.runners)
    }

    return Promise.resolve(oddsList)

  } catch (error) {
    throw error
  }
}


export const deleteCustomMarket = async (marketId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    await pool
      .request()
      .input('marketId', marketId)
      .query(`delete from customMarkets where marketId=@marketId and isCustomMarket=1`);

    await pool
      .request()
      .input('refMarketId', marketId)
      .query(`delete from feederMarketAssignment where refMarketId=@refMarketId`);

    return Promise.resolve(true);

  } catch (error) {
    console.error('rejecting deleteCustomMarket.')
    console.error(error)
    throw (error)
  }
}



export const deleteCustomMarketInPanel = async (marketId) => {
  try {

    await axios.post(
      "https://web-apis.azurewebsites.net/api/deleteCustomMarket", {
      marketId: marketId
    }
    );

    return Promise.resolve(true);

  } catch (error) {
    console.error('rejecting deleteCustomMarket.')
    console.error(error)
    throw (error)
  }
}
export const assignMarketToFeeder = async (payload) => {
  try {

    let pool = await sql.connect(sqlConfig)
    await pool
      .request()
      .input('feederMemberId', payload.feederMemberId)
      .input('refMarketId', payload.marketId)
      .input('marketTypeId', payload.marketTypeId)
      .query(`INSERT INTO feederMarketAssignment ([refMarketId],[refFeederMemberId],[marketTypeId]) VALUES (@refMarketId,@feederMemberId,@marketTypeId)`);

    return Promise.resolve(true);

  } catch (error) {
    throw error;
  }
}
export const getFeederByFeederByMemberId = async (feederMemberId) => {
  try {
    let pool = await sql.connect(sqlConfig)
    let query = await pool
      .request()
      .input('feederMemberId', feederMemberId)
      .query(`SELECT feederMemberId,feederMemberUsername,feederMemberPassword,feederRoleId FROM feederMembers WHERE [feederMemberId] = @feederMemberId`)

    const feederMember = query.recordset[0]

    return Promise.resolve(feederMember)

  } catch (error) {
    console.error('rejecting getFeederByFeederByMemberId')
    console.error(error)
    throw (error)
  }
}
export const changePassword = async (memberId, password) => {
  try {

    let pool = await sql.connect(sqlConfig)
    await pool
      .request()
      .input('feederMemberId', memberId)
      .input('feederMemberPassword', password)
      .query(`update feederMembers SET [feederMemberPassword]=@feederMemberPassword where feederMemberId=@feederMemberId`);

    return Promise.resolve(true);

  } catch (error) {
    console.error('rejecting deleteFeeder.')
    console.error(error)
    throw (error)
  }
}

export const getBookmakerMarketWithCentralIdCentralId = async (sportId, tourId, matchId) => {
  try {

    const market: any = await getBookmakerMarket(matchId, 12);

    const response = await axios.post(
      "https://central3.satsport248.com/api/import_bookmaker_market",
      {
        "access_token": await getBetfairToken(),
        "sport_id": sportId,
        "tournament_id": tourId,
        "match_id": matchId,
        "market_ids": market.marketId
      }
    );

    const centralRes = response.data;

    if (centralRes) {
      market.refCentralId = centralRes.data[0].centralId;
    }

    console.log(market)

    return Promise.resolve(market)

  } catch (error) {
    throw error;
  }
}
export const getBookmakerMarket = async (matchId, typeId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    const marketQuery = await pool
      .request()
      .input('refMatchId', matchId)
      .input('marketTypeId', typeId)
      .query(`select marketId,refMatchId,refMatchName,refTournamentId,refTournamentName,createDate,
        refSportId,refSportName,marketName,matchTime,marketTime,marketType,runners,marketTypeId,
        lastMarketRate from 
        betfairMarkets where
        marketTypeId=@marketTypeId and refMatchId=@refMatchId AND marketName LIKE '%BOOKMAKER%'`)

    const market = marketQuery.recordset[0];

    if (!market) throw { message: 'Unable to find market!', code: 400 }

    market.runners = JSON.parse(market.runners)

    return Promise.resolve(market);

  } catch (error) {
    console.error('rejecting getBookmakerMarket.')
    console.error(error)
    throw (error)
  }
}
export const getBetfairToken = async () => {
  try {


    const response = await axios.post(
      "https://central3.satsport248.com/api/get_access_token",
      {
        agentcode: process.env.agent_code,
        secretkey: process.env.secret_key,
      }
    );

    const accessToken = response.data;

    return Promise.resolve(accessToken.token)

  } catch (err) {
    console.error('rejecting updateFancyMarket', err)
    throw err
  }
}
export const createFeederMember = async (feederMemberUsername, feederMemberPassword) => {
  try {

    const pwdHash = await bcrypt.hashSync(feederMemberPassword, 10);

    let pool = await sql.connect(sqlConfig)
    await pool
      .request()
      .input('feederMemberUsername', feederMemberUsername)
      .input('feederMemberPassword', pwdHash)
      .input('feederRoleId', 2)
      .execute(`InsertOrUpdateFeederMember`)

  } catch (error) {
    console.error('rejecting createFeederMember')
    console.error(error)
    throw (error)
  }
}
export const deleteMarketAssignment = async (feederMarketAssignmentId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    await pool
      .request()
      .input('feederMarketAssignmentId', feederMarketAssignmentId)
      .query(`delete from feederMarketAssignment where feederMarketAssignmentId=@feederMarketAssignmentId`);

  } catch (error) {
    throw error;
  }
}
export const deleteFeeder = async (feederMemberId) => {
  try {
    let pool = await sql.connect(sqlConfig)
    await pool
      .request()
      .input('feederMemberId', feederMemberId)
      .query(`delete from feederMembers where feederMemberId=@feederMemberId`);

    return Promise.resolve(true);

  } catch (error) {
    console.error('rejecting deleteFeeder.')
    console.error(error)
    throw (error)
  }
}
export const getBetfairrMarket = async (matchId, typeId, marketId, centralId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    const marketQuery = await pool
      .request()
      .input('refMatchId', matchId)
      .input('marketTypeId', typeId)
      .input('marketId', marketId)
      .input('refCentralId', centralId)
      .query(`select * from  betfairMarkets        
        WHERE (@marketTypeId IS NULL OR marketTypeId = @marketTypeId)
        AND (@marketId IS NULL OR marketId = @marketId)
        AND (@refCentralId IS NULL OR refCentralId = @refCentralId) 
        AND (@refMatchId IS NULL OR refMatchId = @refMatchId);`)

    const marketList = marketQuery.recordset;

    for (let market of marketList) {
      market.runners = JSON.parse(market.runners)
    }

    return Promise.resolve(marketList);

  } catch (error) {
    console.error('rejecting getBetfairrMarket.')
    console.error(error)
    throw (error)
  }
}
export const authenticateUserRequest = (req): any => {

  let token = null;
  if (!req.headers.authorization) {
    throw { message: "Login Required !", code: 401 }
  }

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  }

  try {
    jwt.verify(token, Buffer.from(jwtkey, 'base64'));
    // console.log(isTokenVerified);
    const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    console.log(decodedToken)

    if (decodedToken.user.feederRoleId != 2) throw { message: 'User Not Authorized!', code: 400 }

    return decodedToken.user
  } catch (err) {
    console.log("invalid token")
    throw { message: "Invaid Token", code: 401 }
  }

}
export const getBetsPlacedOnCustomMarket = async (marketId) => {
  try {

    const response = await axios.post(
      "https://web-apis.azurewebsites.net/api/getBetsPlacedOnCustomMarkets", {
      marketId: marketId
    });

    let betList = response.data;

    return Promise.resolve(betList)

  } catch (error) {
    console.error('rejecting getBetsPlacedOnCustomMarket.')
    console.error(error)
    throw (error)
  }
}
export const getLastMarketRate = async (marketId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let oddQuery = await pool
      .request()
      .input('bmi', marketId)
      .query(`select bmi,ip,mi,ms,eid,rt from customOddsMaster where bmi=@bmi order by customOddsMasterId desc`)

    let lastOdd = null;

    if (oddQuery.recordset[0]) {
      lastOdd = oddQuery.recordset[0];
      lastOdd.rt = JSON.parse(lastOdd.rt)
    }

    return Promise.resolve(lastOdd)
  } catch (error) {
    throw error
  }
}
export const getDbMarkets = async (matchId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let marketQuery = await pool
      .request()
      .input('refMatchId', matchId)
      .query(`select * from betfairMarkets where refMatchId=@refMatchId`);

    let marketList = marketQuery.recordset;

    for (let mrkt of marketList) {
      mrkt.runners = JSON.parse(mrkt.runners)
    }

    return Promise.resolve(marketList)

  } catch (error) {
    throw error;
  }
}
export const getMarketWithUndeclaredResult = async (matchId) => {
  try {

    let pool = await sql.connect(sqlConfig)
    let marketQuery = await pool
      .request()
      .input('matchId', matchId)
      .query(`SELECT marketId,marketTypeId, marketName,runners
      FROM customMarkets 
      WHERE isResultDeclared=0 and refMatchId=@matchId`);

    const markets = marketQuery.recordset;

    for (let mrkt of markets) {
      mrkt.runners = JSON.parse(mrkt.runners)
    }

    return Promise.resolve(markets)

  } catch (error) {
    return error
  }
}
export const getPubsubUrl = async (req) => {
  try {

    // if(webSocket && webSocket.readyState === WebSocket.OPEN){
    //   return token
    // }else{
    //   token = await service.getClientAccessToken({expirationTimeInMinutes:1440})
    //   webSocket = new WebSocket(token.url);
    //   return token
    // }

    const headers = {
      'X-Client-Domain': req.headers['x-client-domain']
    };


    const pubsubUrl = await axios.get("https://web-apis.azurewebsites.net/api/pubsuburl", { headers });

    const resultUrl = pubsubUrl.data;

    return Promise.resolve(resultUrl);

  } catch (error) {
    console.log(error)
    return error
  }
}

export const getReferenceMarket = async (marketTypeId, marketId, matchId) => {
  try {

    let pool = await sql.connect(sqlConfig)

    let betFairMarkets = [];
    let customMarkets = [];

    if (marketTypeId == 12) {
      const betfairMarketQuery = await pool
        .request()
        .input('refMatchId', matchId)
        .query(`select marketId,refMatchId,refMatchName,refTournamentId,refTournamentName,createDate,refCentralId,
            refSportId,refSportName,marketName,matchTime,marketTime,marketType,runners,marketTypeId,
            lastMarketRate from betfairMarkets where
            refMatchId=@refMatchId 
            AND (marketName LIKE '%BOOKMAKER%' OR marketName LIKE '%MATCH ODDS%')`);

      betFairMarkets = betfairMarketQuery.recordset;

      for (let mrkt of betFairMarkets) {
        mrkt.runners = JSON.parse(mrkt.runners);

        for (let rnr of mrkt.runners) {
          rnr.batb = [];
          rnr.batl = [];
        }
      }
    }

    const customMarketQuery = await pool
      .request()
      .input('refMatchId', matchId)
      .input('marketId', marketId)
      .query(`select marketId,refMatchId,refMatchName,refTournamentId,refTournamentName,
            refSportId,refSportName,marketName,marketType,runners,marketTypeId,refCentralId,
            customMinBet,customMaxBet,customMarketSize,customDelay,
            lastMarketRate from customMarkets where
            refMatchId=@refMatchId and 
            marketId=@marketId and
            isResultDeclared=0
            `);

    customMarkets = customMarketQuery.recordset;

    for (let mrkt of customMarkets) {
      mrkt.runners = JSON.parse(mrkt.runners);
    }

    const lastMarkateQuery = await pool
      .request()
      .input('marketId', marketId)
      .query(`select * from customOddsMaster where bmi=@marketId order by customOddsMasterId desc`);

    const lastMrktRt = lastMarkateQuery.recordset;

    for (let lastRt of lastMrktRt) {
      lastRt.rt = JSON.parse(lastRt.rt)
    }

    if (lastMrktRt.length > 0) {
      let lastRateObj = lastMrktRt[0];

      for (let mrkt of customMarkets) {

        mrkt.inPlayStatus = lastRateObj?.ip;
        mrkt.appMarketStatus = lastRateObj?.ms;
        mrkt.isActive = lastRateObj?.ip;

        let rtObj = lastRateObj.rt;

        for (let rnr of mrkt.runners) {
          rnr.batb = []
          rnr.batl = []

          if (lastRateObj) {

            if (marketTypeId == 12) {

              //BOOKMAKER
              const layLastRateObj = rtObj.filter(
                (r) => r.ri == rnr.SelectionId && r.ib == false
              )

              const backLastRateObj = rtObj.filter(
                (r) => r.ri == rnr.SelectionId && r.ib == true
              )

              let horseBackLastRate = []
              let horseLayLastRate = [];

              for (let i = 0; i < backLastRateObj.length; i++) {
                let rate = Math.round(backLastRateObj[i].rt * 100 - 100);

                horseBackLastRate.push({
                  index: 1,
                  odds: rate,
                  tv: backLastRateObj[i].bv,
                  runnerStatus: backLastRateObj[i]?.pr,
                })
              }

              for (let i = 0; i < layLastRateObj.length; i++) {
                let rate = Math.round(layLastRateObj[i].rt * 100 - 100);
                horseLayLastRate.push({
                  index: 1,
                  odds: rate,
                  tv: layLastRateObj[i].bv,
                  runnerStatus: backLastRateObj[i]?.pr,
                })
              }

              rnr.batb = horseBackLastRate;
              rnr.batl = horseLayLastRate;
            }

            if (marketTypeId == 10) {
              //FANCY

              const layLastRateObj = rtObj.filter(
                (r) => r.ri == rnr.SelectionId && r.ib == false
              )

              const backLastRateObj = rtObj.filter(
                (r) => r.ri == rnr.SelectionId && r.ib == true
              )

              let horseBackLastRate = []
              let horseLayLastRate = [];

              for (let i = 0; i < backLastRateObj.length; i++) {
                let rate = Math.round(backLastRateObj[i].rt);

                horseBackLastRate.push({
                  index: 1,
                  odds: rate,
                  tv: backLastRateObj[i].bv,
                  runnerStatus: backLastRateObj[i]?.pr,
                })
              }

              for (let i = 0; i < layLastRateObj.length; i++) {
                let rate = Math.round(layLastRateObj[i].rt);
                horseLayLastRate.push({
                  index: 1,
                  odds: rate,
                  tv: layLastRateObj[i].bv,
                  runnerStatus: backLastRateObj[i]?.pr,
                })
              }

              rnr.batb = horseBackLastRate;
              rnr.batl = horseLayLastRate;
            }
          }
        }
      }

    }

    return Promise.resolve({ betFairMarkets, customMarkets });

  } catch (error) {
    console.error('rejecting getReferenceMarket.')
    console.error(error)
    throw (error)
  }
}
export const getResult = async(marketIds)=>{
  try{

    console.log("======market ids=-==========")
    console.log(marketIds);


    const marketIdList: string = marketIds;
    const values: string[] = marketIdList.split(',');
    console.log(values);
    
    let marketToCheck = values.map((mrkt) => `'${mrkt}'`).join(',');

    let pool = await sql.connect(sqlConfig)
    let resultQuery =  await pool
      .request()
      .query(`select * from resultMaster where marketId IN (${marketToCheck})`);
    
    const result = resultQuery.recordset;

    console.log("=============result")
    console.log(result)

    let resultArr = [];

    for(let res of result){
      resultArr.push({Result:res.selectionId,sourceMarketID:res.marketId})
    }

    return Promise.resolve(resultArr)

  }catch(error){
    return error
  }
}

export const insertOdds = async(body,feederId)=>{
  try{

    const market = await getCustomMarketForFeederPanel(null,null,body.bmi,null);

    let marketName = null;
    let matchName = null;
    let runners = null

    if(market.length>0){
      marketName = market[0].marketName;
      matchName = market[0].refMatchName;
      runners = JSON.stringify(market[0].runners);
    }

    let pool = await sql.connect(sqlConfig)
      await pool
      .request()
      .input('bmi', body.bmi)
      .input('ip', body.ip)
      .input('mi', body.mi)
      .input('ms', body.ms)
      .input('eid', body.eid)
      .input('rt', JSON.stringify(body.rt))
      .input('feederId',feederId)
      .input('marketName', marketName)
      .input('matchName',matchName)
      .input('ipAddress',body.ipAddress)
      .input('runners',runners)
      .query(`INSERT INTO customOddsMaster 
        ([bmi],[ip],[mi],[ms],[eid],[rt],[feederId],[marketName],[matchName],[ipAddress],[runners]) VALUES 
        (@bmi,@ip,@mi,@ms,@eid,@rt,@feederId,@marketName,@matchName,@ipAddress,@runners)`)

  }catch(error){
    throw error
  }
}
export const insertResult = async(body,market)=>{
  try{

    console.log(market)

    let pool = await sql.connect(sqlConfig)
      await pool
      .request()
      .input('marketId', body.marketId)
      .input('selectionId', body.selectionId)
      .input('selectionName', body.selectionName)
      .input('matchId', market.refMatchId)
      .input('matchName', market.refMatchName)
      .input('sportId', market.refSportId)
      .input('sportName', market.refSportName)
      .input('tournamentId', market.refTournamentId)
      .input('tournamentName', market.refTournamentName)
      .input('marketName', market.marketName)
      
      .query(`INSERT INTO resultMaster 
        ([marketId],[selectionId],[selectionName],[matchId],[matchName],[sportId],[sportName],[tournamentId],[tournamentName],[marketName]) VALUES 
        (@marketId,@selectionId,@selectionName,@matchId,@matchName,@sportId,@sportName,@tournamentId,@tournamentName,@marketName)`)


      await pool
      .request()
      .input('marketId', body.marketId)
      .query(`UPDATE customMarkets SET isResultDeclared=1 where marketId=@marketId`)


        // await declareResultInPanel(body.marketId);
  
  return Promise.resolve(true)

  }catch(error){
    throw error
  }
}
export const triggerAdminPubSub = async(message)=>{
  
  try{
    let service = new WebPubSubServiceClient(process.env.userAdminPubSubConnStr, process.env.userAdminHub)
    await service.sendToAll(message);
  }catch(error){
    console.log("error in triggerpubsub occured")
  }
}
export const getCustomMarketBySequence = async(matchId,typeId,marketId,centralId)=>{
  try{

    let pool = await sql.connect(sqlConfig)
      const marketQuery = await pool
      .request()
      .input('refMatchId', matchId)
      .input('marketTypeId', typeId)
      .input('marketId', marketId)
      .input('refCentralId', centralId)
      .query(`select marketId,sequenceNo from 
        customMarkets
        WHERE (@marketTypeId IS NULL OR marketTypeId = @marketTypeId) 
        AND (@marketId IS NULL OR marketId = @marketId)
        AND (@refCentralId IS NULL OR refCentralId = @refCentralId) 
        AND (@refMatchId IS NULL OR refMatchId = @refMatchId) ORDER BY sequenceNo ASC `)

      const marketList = marketQuery.recordset;

      return Promise.resolve(marketList);

  }catch(error){
    console.error('rejecting getCustomMarketForFeederPanel.')
    console.error(error)
    throw (error)
  }
}
export const updateCustomMarketSequence = async(marketId,sequenceNo)=>{
  try{
  
    let pool = await sql.connect(sqlConfig)
      await pool
      .request()
      .input('marketId', marketId)
      .input('sequenceNo',sequenceNo)
      .query(`UPDATE  customMarkets SET sequenceNo = @sequenceNo WHERE marketId = @marketId`)
    
    return Promise.resolve(true)

  }catch(error){
    console.error('rejecting saveCustomMarket.')
    console.error(error)
    throw (error)
  }
}
export const generateCentralId = ()=>{
  return (Math.floor(Math.random() * (80000000 - 70000000 + 1)) + 70000000).toString();
}
export const saveCustomMarket = async(body,createdByMemberId)=>{
  try{
  
    let pool = await sql.connect(sqlConfig)
      await pool
      .request()
      .input('marketId', body.marketId)
      .input('refMatchId', body.matchId)
      .input('refMatchName', body.matchName)
      .input('refTournamentId', body.tournamentId)
      .input('refTournamentName', body.tournamentName)
      .input('refSportId', body.sportId)
      .input('refSportName', body.sportName)
      .input('marketName', body.marketName)
      .input('eventName', body.matchName)
      .input('marketTime', body.marketTime)
      .input('marketType', body.marketType)
      .input('runners', JSON.stringify(body.runners))
      .input('marketTypeId', body.marketTypeId)
      .input('refCentralId', body.centralId)
      .input('isCustomMarket', 1)
      .input('customMinBet', body.minBet)
      .input('customMaxBet', body.maxBet)
      .input('customMarketSize', body.marketSize)
      .input('customDelay', body.delay)
      .input('createdByMemberId', createdByMemberId)
      .input('sequenceNo', body.sequenceNo)
      .query(`INSERT INTO customMarkets 
        ([marketId],[refMatchId],[refMatchName],[refTournamentId],[refTournamentName],[refSportId],[refSportName],[marketName],[eventName],
        [marketTime],[marketType],[runners],[marketTypeId],[refCentralId],[isCustomMarket],[customMinBet],[customMaxBet],[customMarketSize],[customDelay],[createdByMemberId], [sequenceNo]) VALUES 
        (@marketId,@refMatchId,@refMatchName,@refTournamentId,@refTournamentName,@refSportId,@refSportName,@marketName,@eventName,
          @marketTime,@marketType,@runners,@marketTypeId,@refCentralId,@isCustomMarket,@customMinBet,@customMaxBet,@customMarketSize,@customDelay,@createdByMemberId, @sequenceNo)`)
    
    return Promise.resolve(true)

  }catch(error){
    console.error('rejecting saveCustomMarket.')
    console.error(error)
    throw (error)
  }
}
export const updateFancyMarket = async()=>{
  try{
    let pool = await sql.connect(sqlConfig);
    let result = await pool
    .request()
    .query(`select * from betfairMatches where refSportId='4'`)
    let betfairMatches = result?.recordset;

    let result2 = await pool
    .request()
    .query(`select * from betfairTournaments where refSportId='4'`)
    let tournaments = result2?.recordset;

    try{

    for(const tour of tournaments){
      for(const match of betfairMatches){
        if(tour.tournamentId == match.refTournamentId){

          const response = await axios.post(
            "https://web-apis.azurewebsites.net/api/getBetfairFancyBookmakerMarkets",
            {
              "sportId": match.refSportId,
              "tourId":match.refTournamentId,
              "matchId":match.matchId
          }
          );
    
          const fancyMarketList = response.data;

          
          if(fancyMarketList.appdata){

            const latestFancyList = fancyMarketList.appdata;
    
            const existingMarketList = await getMarketByMatchId(match.matchId);

            const newMarkets:any = latestFancyList.filter(latestMrkt => !existingMarketList.some(existingMrkt => existingMrkt.marketId === latestMrkt.marketID.toString()));
    
            const oldMarkets:any = existingMarketList.filter(o => !latestFancyList.some(market => o.marketId === market.marketID.toString()));

            if(oldMarkets.length>0){
              let oldMarketIdString = oldMarkets.map((mrkt) => `'${mrkt.marketId}'`).join(',');
              
              await deleteOldMarkets(oldMarketIdString);
            }
           
            const marketIds = newMarkets.map(mrkt=>mrkt.marketID).toString();

            if(marketIds){
              const centralReq = await axios.post(
                "https://web-apis.azurewebsites.net/api/importFancyBookmakerMarket",
                {
                  "sportId": match.refSportId,
                  "tournamentId":match.refTournamentId,
                  "matchId":match.matchId,
                  "marketIds":marketIds
              }
              );
    
              const centralData = centralReq.data;
    
            if(centralData.data){
              
              for(const mrkt of newMarkets){
    
                for(let centralId of centralData.data){
    
                  if (centralId.centralId != 0 && centralId.centralId != undefined && centralId.centralId != '') {
    
                    if(mrkt.marketID.toString() == centralId.marketId){
                      
                      mrkt.refCentralId = centralId.centralId;
                      mrkt.Event = match.matchName;
                      mrkt.centralId = centralId.centralId;
    
                      let runners = [];
        
                      mrkt.runner.forEach(rnr=>{
                        let runner = {
                          SelectionId: rnr.selectionID,
                          RunnerName: rnr.runnerName,
                          Handicap: 0
                        }
                        runners.push(runner)
                      })

                      mrkt.runners = runners;

                      if(runners.length>0){

                        await setMarketRateForNewFancyMarket(mrkt);

                        await saveMarketsForFancy(match.refSportId,'Cricket',tour.tournamentId,tour.tournamentName,match.matchId,match.matchName,match.openDate,mrkt);
                      }
                    }
                  }
                }
              }
            }
            }
          }
        }
      }
    }
    }catch(error){
      console.log('error in update fancy')
    }
    
    return Promise.resolve(true);

  }catch(err){
    console.error('rejecting updateFancyMarket', err)
    throw err
  }
}


export const saveCustomMarketInPanel = async(marketData)=>{
  try{

    await axios.post(
      "https://web-apis.azurewebsites.net/api/saveCustomMarket",{
        marketData:marketData
      }
    );

      return Promise.resolve(true);
  }catch(error){
    console.error('rejecting saveCustomMarketInPanel.')
    console.error(error)
    throw (error)
  }
}
export const getMarketByMatchId = async (refMatchId) => {
  try {
    let pool = await sql.connect(sqlConfig)
    let result = await pool
      .request()
      .input('refMatchId', refMatchId)
      .query(`SELECT marketId,marketName from betfairMarkets where refMatchId = @refMatchId and isCustomMarket=0 and (marketTypeId = 10 or marketTypeId = 12)`)

    return Promise.resolve(result.recordset)
  } catch (error) {
    console.error('rejecting getMarketByMatchId', error)
    throw new Error(error)
  }
}


export const deleteOldMarkets = async(oldMarketId)=>{
  try{

    let pool = await sql.connect(sqlConfig)
    await pool
    .request()
    .query(`DELETE from betfairMarkets where marketId IN (${oldMarketId})`)
    
    // await pool
    //   .request()
    //   .query(`delete from customMarkets where marketId IN (${oldMarketId})`);
    
    // await pool
    //   .request()
    //   .query(`delete from feederMarketAssignment where refMarketId IN (${oldMarketId})`);

    return Promise.resolve(true)
  }catch(error){
    console.error('rejecting deleteOldMarkets', error)
    throw new Error(error)
  }
}




export const setMarketRateForNewFancyMarket = async(marketDataObj)=>{
  try{
    
    console.log('inside set market rate for new fancy',marketDataObj.centralId)

    const response = await axios.post(
      "https://web-apis.azurewebsites.net/api/getCentralLastMarketRate",
      {
        "centralId": marketDataObj.centralId
    }
    );

    const lastMarketRate = response.data;

    if(lastMarketRate){

      lastMarketRate.forEach((rate) => {
        if (rate.appRate) {
          rate.appRate = JSON.parse(rate.appRate)
        }
      })

      let rtList = [];

      for(let lr of lastMarketRate){
          if(lr.appRate){
            for(let rt of lr.appRate){
              rtList.push({
                ri:rt.appSelectionID_BF,
                rt:rt.appRate,
                bv:rt.appBFVolume,
                pr:rt.appPriority,
                af:0,
                ib:rt.appIsBack,
                pt:rt.appPoint
              })
            }
          }
      }

      let lastMarketObj = {
        bmi: lastMarketRate[0].appMarketID,
        ip: lastMarketRate[0].appIsInPlay,
        mi: marketDataObj.centralId,
        ms: lastMarketRate[0].appMarketStatus,
        eid: lastMarketRate[0].appMatchEventID,
        grt: lastMarketRate[0].appGetRecordTime,
        rt: rtList
    }

    marketDataObj.lastMarketRate = JSON.stringify(lastMarketObj);

    }

  }catch(err){
    console.error('rejecting updateFancyMarket', err)
    throw err
  }
}




export const saveMarketsForFancy = async (
  sportId,
  sportName,
  tournamentId,
  tournamentName,
  matchId,
  matchName,
  matchTime,
  market
) => {
  try {

    let marketType = "";
    market.marketID = market.marketID.toString();
    if(market.marketType == 10){
        marketType = "Fancy"
    }else if(market.marketType == 12){
      marketType = "Bookmaker"
    }

    let pool = await sql.connect(sqlConfig)
      await pool
      .request()
      .input('marketId', market.marketID)
      .input('refMatchId', matchId)
      .input('refMatchName', matchName)
      .input('refTournamentId', tournamentId)
      .input('refTournamentName', tournamentName)
      .input('refSportId', sportId)
      .input('refSportName', sportName)
      .input('matchTime', matchTime)
      .input('eventType', null)
      .input('marketName', market.marketName)
      .input('eventName', market.Event)
      .input('competition', market.Competition)
      .input('isMarketDataDelayed', null)
      .input('isPersistenceEnabled', null)
      .input('isBspmarket', null)
      .input('marketTime', matchTime)
      .input('suspendTime', null)
      .input('settleTime', null)
      .input('bettingType', null)
      .input('isTurnInPlayEnabled', null)
      .input('marketType', marketType)
      .input('regulator', null)
      .input('marketBaseRate', null)
      .input('isDiscountAllowed', null)
      .input('wallet', null)
      .input('rules', null)
      .input('rulesHasDate', null)
      .input('clarifications', null)
      .input('runners', JSON.stringify(market.runners))
      .input('marketTypeId', market.marketType)
      .input('refCentralId', market.refCentralId)
      .input('lastMarketRate', market.lastMarketRate)
      .input('isCustomMarket', 0)
      .query(`INSERT INTO betfairMarkets ([marketId],[refMatchId],[refTournamentId],[refSportId],[eventType],[marketName],[eventName],[competition],[isMarketDataDelayed],
          [isPersistenceEnabled],[isBspmarket],[marketTime],[suspendTime],[settleTime],[bettingType],
          [isTurnInPlayEnabled],[marketType],[regulator],[marketBaseRate],[isDiscountAllowed],[wallet],
          [rules],[rulesHasDate],[clarifications],[runners],[marketTypeId],[refMatchName],[refTournamentName],[refSportName],[matchTime],[refCentralId],[lastMarketRate],[isCustomMarket]) 
        SELECT @marketId,@refMatchId,@refTournamentId,@refSportId,@eventType,@marketName,@eventName,@competition,@isMarketDataDelayed,
          @isPersistenceEnabled,@isBspmarket,@marketTime,@suspendTime,@settleTime,@bettingType,@isTurnInPlayEnabled,@marketType,@regulator,
          @marketBaseRate,@isDiscountAllowed,@wallet,@rules,@rulesHasDate,@clarifications,@runners,@marketTypeId,@refMatchName,@refTournamentName,@refSportName,@matchTime,@refCentralId,@lastMarketRate,@isCustomMarket
          WHERE NOT EXISTS (
            SELECT 1 FROM betfairMarkets WHERE [marketId] = @marketId
        );
          `)

  } catch (error) {
    console.error('rejecting saveMarketsForFancy')
    console.error(error)
    throw new Error(error)
  }
}

export const updateCustomMarket = async(body)=>{
  try{

    console.log(body)

    let pool = await sql.connect(sqlConfig)
       await pool
      .request()
      .input('customMinBet', body.minBet)
      .input('customMaxBet', body.maxBet)
      .input('customMarketSize', body.marketSize)
      .input('marketId', body.marketId)
      .input('marketName', body.marketName)
      .input('sequenceNo', body.sequenceNo)
      .input('runners', JSON.stringify(body.runners))

      .query(`update customMarkets SET 
      customMinBet=@customMinBet,customMaxBet=@customMaxBet,
      customMarketSize=@customMarketSize,marketName=@marketName,runners=@runners,sequenceNo=@sequenceNo where marketId=@marketId `)

  }catch(error){
    console.error('rejecting updateCustomMarket.')
    console.error(error)
    throw (error)
  }
}


export const updateCustomMarketInPanel = async(body)=>{
  try{

    const response = await axios.post(
      "https://web-apis.azurewebsites.net/api/updateCustomMarket",{
        marketId:body.marketId,
        minBet:body.minBet,
        maxBet:body.maxBet,
        delay:0,
        marketSize:body.marketSize,
        runners:body.runners,
        marketName:body.marketName,
        sequenceNo:body.sequenceNo
      }
    );

  }catch(error){
    console.error('rejecting updateCustomMarketInPanel.')
    console.error(error)
    throw (error)
  }
}
export const updateFeederMember = async(feederMemberId,feederMemberUsername,feederMemberPassword)=>{
  try{

    const pwdHash = await bcrypt.hashSync(feederMemberPassword, 10);

    let pool = await sql.connect(sqlConfig)
    await pool
    .request()
    .input('feederMemberId', feederMemberId)
    .input('feederMemberUsername', feederMemberUsername)
    .input('feederMemberPassword', pwdHash)
    .query(`UPDATE feederMembers SET [feederMemberUsername] = @feederMemberUsername,[feederMemberPassword]=@feederMemberPassword where feederMemberId=@feederMemberId`)


  }catch(error){
    console.error('rejecting updateFeederMember')
    console.error(error)
    throw (error)
  }
}
export const updateAllMarkets = async(sportsData)=>{
  try{

    await deleteAllTables();

    for(let sport of sportsData){
      await insertSports(sport);

      for(let tour of sport.Tournaments){
        await insertTournaments(tour,sport.EventType.Id);

        for(let match of tour.Matches){
          await insertMatches(match,sport.EventType.Id,tour.Competition.Id);

          for(let market of match.Markets){
            await insertMatchOddsMarket(market,match.Event.Id,match.Event.Name,tour.Competition.Id,tour.Competition.Name,sport.EventType.Id,sport.EventType.Name,match.Event.Name);
          }
        }
      }
    }

    await deleteAssignments();
    
  }catch(error){
    console.error('rejecting updateAllMarkets', error)
    throw error
  }
}
export const deleteAllTables = async()=>{
  try{

    let pool = await sql.connect(sqlConfig);

    await pool
    .request()
    .query(`delete from betfairMarkets`)

    await pool
    .request()
    .query(`delete from betfairMatches`)


    await pool
    .request()
    .query(`delete from betfairTournaments`)


    await pool
    .request()
    .query(`delete from betfairSports`)


  }catch(err){
    console.error('rejecting deleteAllTables', err)
    throw err
  }
}



export const deleteAssignments = async()=>{
  try{

    let pool = await sql.connect(sqlConfig);
    await pool
    .request()
    .query(`DELETE from feederMarketAssignment where refMarketId NOT IN (SELECT marketId from betfairMarkets)`)

  }catch(error){
    console.error('rejecting deleteAssignments', error)
    throw error
  }
}

export const insertSports = async(body)=>{
  try{

    let pool = await sql.connect(sqlConfig);
    await pool
    .request()
    .input('sportId', body.EventType.Id)
    .input('sportName', body.EventType.Name)
    .input('isActive', 1)
   
    .query(`INSERT INTO betfairSports 
      ([sportId],[sportName],[isActive]) VALUES 
      (@sportId,@sportName,@isActive)`)

  }catch(err){
    console.error('rejecting insertSports', err)
    throw err
  }
}



export const insertTournaments = async(body,refSportId)=>{
  try{

    let pool = await sql.connect(sqlConfig);
    await pool
    .request()
    .input('tournamentId', body.Competition.Id)
    .input('refSportId', refSportId)
    .input('tournamentName',body.Competition.Name)
   
    .query(`INSERT INTO betfairTournaments 
      ([tournamentId],[refSportId],[tournamentName]) VALUES 
      (@tournamentId,@refSportId,@tournamentName)`)

  }catch(err){
    console.error('rejecting insertTournaments', err)
    throw err
  }
}


export const insertMatches = async(body,sportId,tourId)=>{
  try{

    let pool = await sql.connect(sqlConfig);
    await pool
    .request()
    .input('matchId', body.Event.Id)
    .input('refSportId', sportId)
    .input('refTournamentId',tourId)
    .input('matchName',body.Event.Name)
   
    .query(`INSERT INTO betfairMatches 
      ([matchId],[refSportId],[refTournamentId],[matchName]) VALUES 
      (@matchId,@refSportId,@refTournamentId,@matchName)`)

  }catch(error){
    console.error('rejecting insertMatches', error)
    throw error
  }
}


export const insertMatchOddsMarket = async(body,matchId,matchName,tourId,tourName,refSportId,refSportName,eventName)=>{
  try{

    let pool = await sql.connect(sqlConfig);
    await pool
    .request()
    .input('marketId', body.MarketId)
    .input('refMatchId', matchId)
    .input('refMatchName',matchName)
    .input('refTournamentId',tourId)
    .input('refTournamentName',tourName)
    .input('refSportId',refSportId)
    .input('refSportName',refSportName)
    .input('marketName',"MATCH ODDS")
    .input('eventName',eventName)
    .input('marketType',"MATCH_ODDS")
    .input('runners',JSON.stringify(body.Runners))
    .input('marketTypeId',1)
    .input('isCustomMarket',0)
   
    .query(`INSERT INTO betfairMarkets 
      ([marketId],[refMatchId],[refMatchName],[refTournamentId],[refTournamentName],[refSportId],[refSportName],[marketName],[eventName],[marketType],
        [runners],[marketTypeId],[isCustomMarket]) VALUES 
      (@marketId,@refMatchId,@refMatchName,@refTournamentId,@refTournamentName,@refSportId,@refSportName,@marketName,@eventName,
        @marketType,@runners,@marketTypeId,@isCustomMarket)`)

  }catch(error){
    console.error('rejecting insertMatchOddsMarket', error)
    throw error
  }
}