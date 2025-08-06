import crypto from 'crypto';
export interface PayUHashParams {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

export interface PayUResponse {
  status: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  hash: string;
}

export interface PaymentFormData {
  firstname: string;
  email: string;
  phone: string;
  amount: string;
  productinfo: string;
}


export function generatePayUHash(params: PayUHashParams, salt: string): string {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = '',
  } = params;

  // Construct string with 15 pipes as per PayU V19 format
  const hashString = [
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    '', '', '', '', '', // udf6 to udf10 (not used here)
    salt,
  ].join('|');

  return crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();
}



export const generateTxnId = (): string => {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

export const verifyPayUResponse = (response: PayUResponse, salt: string): boolean => {
  const {
    status,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    hash: responseHash,
  } = response;

  const key = process.env.MERCHANT_KEY!;
  
  const hashString = `${salt}|${status}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  
  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

  return calculatedHash === responseHash;
};
