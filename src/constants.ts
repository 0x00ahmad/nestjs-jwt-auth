import axios from "axios";

export const PASSWORD_LENGTH = 12;
export enum PasswordProcessMethod {
  passwordHash = "passwordHash",
  passwordLessWithEmail = "passwordLessWithEmail",
}
export const Constants = {
  domain_name: process.env.DOMAIN_NAME || "awesome.localhost.com",
  debug_secret: process.env.DEBUG_SECRET || "testingdebugsecret",
  secret: process.env.SECRET,
  twoFaCodeLength: 6,
  twoFaCounter: 30, // set in seconds
  at_signing_key: process.env.JWT_ACCESS_SECRET,
  rt_signing_key: process.env.JWT_REFRESH_SECRET,
  internalApiKey: process.env.INTERNAL_API_KEY,
  // * configure this according to the project spec
  localPasswordProcessMethod: PasswordProcessMethod.passwordHash,
  // service Urls
  transactionServiceUrl: process.env.TRANSACTION_SERVICE_URL,
};

export const sendRequest = async (
  url: string,
  method: "get" | "post" | "put" | "delete",
  data: any,
  headers = {}
) => {
  const baseHeaders = {
    Authorization: `Bearer ${Constants.internalApiKey}`,
    "Content-Type": "application/json",
  };
  if (method === "get") {
    return axios({
      method: method,
      url: url,
      headers: {
        ...baseHeaders,
        ...headers,
      },
    });
  } else {
    return axios({
      method: method,
      url: url,
      headers: {
        ...baseHeaders,
        ...headers,
      },
      data,
    });
  }
};

export class ResponseContext {
  ok: boolean;
  msg: string;
}
