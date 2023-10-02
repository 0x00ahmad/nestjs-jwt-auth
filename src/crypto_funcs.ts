import * as bcrypt from "bcrypt";

export interface HashObject {
  hash: string;
  salt: string;
}

// * hashing functions

export const hashData = async (data: string): Promise<string> => {
  return bcrypt.hash(data, 10);
};

export const verifyHash = (hash: string, str: string): Promise<boolean> => {
  return bcrypt.compare(str, hash);
};
