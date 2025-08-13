import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import {connectToDatabase as dbConnect} from "@/lib/Database/mongodb";
import Alert from "@/lib/Database/Models/Alert";
import {User} from "@/lib/Database/Models/User";
import {stockApi} from "@/lib/api/stock-api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  const transporter = nodemailer.createTransport({
    service: "gmail", // or SMTP config
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const activeAlerts = await Alert.find({ status: "active" });

  let triggeredCount = 0;

  for (const alert of activeAlerts) {
    try {
      const priceData = await stockApi.getQuote(alert.symbol);
      const currentPrice = priceData.price;
      let shouldTrigger = false;

      if (alert.type === "price") {
        if (alert.direction === "above" && currentPrice >= alert.targetPrice) {
          shouldTrigger = true;
        }
        if (alert.direction === "below" && currentPrice <= alert.targetPrice) {
          shouldTrigger = true;
        }
      }

      if (shouldTrigger) {
        const user = await User.findById(alert.userId);
        if (!user || !user.email) continue;

        await transporter.sendMail({
          from: `"TradeView Alerts" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: `Price Alert Triggered: ${alert.symbol}`,
          text: `Your alert for ${alert.symbol} was triggered.\n
Condition: ${alert.direction.toUpperCase()} ${alert.targetPrice}\n
Current Price: ${currentPrice}`,
        });

        alert.status = "triggered";
        alert.triggeredAt = new Date();
        await alert.save();

        triggeredCount++;
      }
    } catch (err) {
      console.error(`Error processing alert ${alert._id}:`, err);
    }
  }

  res.status(200).json({
    message: `Alert check completed`,
    triggeredCount,
  });
}
