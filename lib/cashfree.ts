import crypto from "crypto";

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtMlxd9nGI57WmLGAoo55
W/1J4YMDjYsgue9EI3yb4GSItdwi3xznJZLC7pbMTvD6K9T8VAE9dMCjuOtwnMwh
yxt7FRAPF0yG+9gFIkE3szweV/o1vQrXCSVHKX9hGvab1z/X11AyZVa0NrpcXOQV
A0oByCyGmuz6kt8lW9bISytHQVyyCobJWaIBJ7pQ5gIEPqNI+lSLtdu+s5vHeu7l
BPoIpKkT9dDJO9E+lPa5dA6A35qtbkyfIzXJnaTTRspDpxH3otiph9ZXrijPNfO0
DIhQsOv5mTEbVt4frkL8L2CnmLnxO/Z8V0pfyDgkn00eXa0IUHhDgvtXDfoWArno
bwIDAQAB
-----END PUBLIC KEY-----`;

let cachedToken: string | null = null;
let tokenExpiry = 0;


export async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const baseUrl = process.env.CASHFREE_PAYOUT_BASE_URL;

  if (!clientId || !clientSecret || !baseUrl) {
    throw new Error("Missing Cashfree credentials");
  }

  const timestamp = Math.floor(now / 1000);
  const dataToEncrypt = `${clientId}.${timestamp}`;

  const encryptedBuffer = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(dataToEncrypt)
  );

  const signature = encryptedBuffer.toString("base64");

  const res = await fetch(`${baseUrl}/payout/v1/authorize`, {
    method: "POST",
    headers: {
      "X-Client-Id": clientId,
      "X-Client-Secret": clientSecret,
      "X-Cf-Signature": signature,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({})
  });

  const data = await res.json();
  if (data.status !== "SUCCESS") throw new Error("Failed to fetch token");

  cachedToken = data.data.token;
  tokenExpiry = now + data.data.expires_in * 1000 - 10_000;
  return cachedToken;
}

export async function addBeneficiary({
  beneId,
  name,
  email,
  phone,
  bankAccount,
  ifsc,
}: {
  beneId: string;
  name: string;
  email?: string;
  phone?: string;
  bankAccount: string;
  ifsc: string;
}) {
  const token = await getAccessToken();
  const baseUrl = process.env.CASHFREE_PAYOUT_BASE_URL;

  const res = await fetch(`${baseUrl}/payout/v1.2/addBeneficiary`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      beneId,
      name,
      email,
      phone,
      bankAccount,
      ifsc,
      address1: "India",
    })
  });

  const data = await res.json();
  if (data.status !== "SUCCESS") throw new Error("Failed to add beneficiary");
  return data;
}

export async function requestTransfer({
  transferId,
  beneId,
  amount,
  remarks = "Withdrawal",
  transferMode = "banktransfer", // default mode
}: {
  transferId: string;
  beneId: string;
  amount: number;
  remarks?: string;
  transferMode?: string; // make it flexible
}) {
  const token = await getAccessToken();
  const baseUrl = process.env.CASHFREE_PAYOUT_BASE_URL;

  if (!token || !baseUrl) {
    throw new Error("Missing Cashfree token or base URL");
  }

  const payload = {
    beneId,
    amount,
    transferId,
    transferMode,
    remarks,
  };

  const res = await fetch(`${baseUrl}/payout/v1/requestTransfer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (res.status !== 200 || data.status !== "SUCCESS") {
    console.error("[CASHFREE_TRANSFER_FAILED]", { status: res.status, response: data });
    throw new Error("Transfer failed: " + (data.message || "Unknown error"));
  }

  return data;
}


export async function getTransferStatus(transferId: string) {
  const token = await getAccessToken();
  const baseUrl = process.env.CASHFREE_PAYOUT_BASE_URL;

  const res = await fetch(`${baseUrl}/payout/v1/getTransferStatus?transferId=${transferId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  const data = await res.json();
  if (!data) throw new Error("Could not retrieve transfer status");
  return data;
}

export async function requestBatchTransfer({
  batchTransferId,
  batch,
}: {
  batchTransferId: string;
  batch: {
    transferId: string;
    beneId: string;
    amount: number;
    remarks?: string;
    transferMode?: string;
  }[];
}) {
  const clientId = process.env.CASHFREE_CLIENT_ID!;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET!;
  const baseUrl = process.env.CASHFREE_PAYOUT_BASE_URL!; // e.g., https://payout-gamma.cashfree.com

  const payload = {
    batchTransferId,
    batchFormat: "BENE_ID",
    deleteBene: 0,
    batch: batch.map(entry => ({
      ...entry,
      transferMode: entry.transferMode || "banktransfer",
      remarks: entry.remarks || "Test batch payout",
    })),
  };

  const bodyString = JSON.stringify(payload);
  const xCfSignature = crypto
    .createHmac("sha256", clientSecret)
    .update(bodyString)
    .digest("base64");

  const res = await fetch(`${baseUrl}/payout/v1/requestBatchTransfer`, {
    method: "POST",
    headers: {
      "X-Client-Id": clientId,
      "X-Cf-Signature": xCfSignature,
      "Content-Type": "application/json",
    },
    body: bodyString,
  });

  const data = await res.json();
  if (data.status !== "SUCCESS") {
    console.error("[SANDBOX BATCH FAILED]", data);
    throw new Error(data.message || "Batch transfer failed");
  }

  return data;
}

