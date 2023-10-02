import { ApiResponse } from "../../common/dto";
import { PassCode, Tokens } from "../types";

//
// INFO: these are used for testing purposes
//

export const passCodeStub = (): PassCode => {
  return { code: "wkdbecu38cjk" };
};

export const tokensStub = (): Tokens => {
  return {
    access_token: "as98dfn8960asdf6a09sdfmy0k921klx87ryjx92183rkyuh031298fiu",
    refresh_token: "s89payj8309ryj123uk8prxk0889asd0fj6y0iy213kr08716j2xt308a7",
  };
};

export const logOutStub = (): ApiResponse => {
  return { detail: "Session successfully logged out" };
};

export const deleteAccountStub = (): ApiResponse => {
  return { detail: "Account successfully deleted" };
};
