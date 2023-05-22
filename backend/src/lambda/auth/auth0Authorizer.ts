import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-d6lmmgkzu0yyqpu8.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const jwtKID: string = jwt.header.kid;

  if (!jwtKID) {
    // we are only supporting RS256 so fail if this happens.
    throw new Error('Invalid Token!');
  }

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const cert = await getJWTCert(jwtKID);
  //verify token
  return verify(
    token,           // Token from an HTTP header to validate
    cert,            // A certificate copied from Auth0 website
    { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
  ) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getJWTCert(jwtKID: string): Promise<string> {
  const response = await Axios.get(jwksUrl);

  //get x5c from JwksKey and mapping with token to get cert
  const keyARR = response.data.keys;

  console.log('Arr ', keyARR);
  /**list x5c that map with kid from provided token */
  const listx5c = keyARR.filter(key =>
    key.kid === jwtKID
    && (key.x5c && key.x5c.length)
  )

  if (!listx5c.length) throw new Error('Invalid Credentials!');
  //change to cert
  let keyX5C = listx5c[0].x5c;
  console.log("keyX6c", keyX5C);
  
  keyX5C = keyX5C[0].match(/.{1,64}/g).join('\n')
  const cert = `-----BEGIN CERTIFICATE-----\n${keyX5C}\n-----END CERTIFICATE-----\n`;
  return cert;
}
