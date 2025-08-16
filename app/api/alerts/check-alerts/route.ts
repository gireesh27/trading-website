import nodemailer from "nodemailer";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import Alert from "@/lib/Database/Models/Alert";
import { User } from "@/lib/Database/Models/User";
import { stockApi } from "@/lib/api/stock-api";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: Request) {
  await dbConnect();

  // ✅ Get the session of the logged-in user
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    console.error("Not authenticated");
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // ✅ Only fetch alerts for this logged-in user
  const activeAlerts = await Alert.find({
    status: "active",
    userId: session.user.id,
  });

  let triggeredCount = 0;

  for (const alert of activeAlerts) {
    try {
      const priceData = await stockApi.getQuote(alert.symbol);
      const currentPrice = priceData.price;

      let shouldTrigger = false;

      if (alert.type === "price") {
        if (
          alert.direction === "above" &&
          currentPrice >= (alert.targetPrice ?? 0)
        )
          shouldTrigger = true;
        if (
          alert.direction === "below" &&
          currentPrice <= (alert.targetPrice ?? 0)
        )
          shouldTrigger = true;
      }

      if (shouldTrigger) {
        const user = await User.findById(alert.userId);
        if (!user || !user.email) continue;

        // ✅ Send email notification
        await transporter.sendMail({
          from: `"TradeView Alerts" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: `Price Alert Triggered: ${alert.symbol}`,
          text: `Hi ${user.name || ""},

Your alert for ${alert.symbol} was triggered.
Condition: ${alert.direction?.toUpperCase()} ${alert.targetPrice}
Current Price: ${currentPrice}`.trim(),
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

  return new Response(
    JSON.stringify({ message: "Alert check completed", triggeredCount }),
    { status: 200 }
  );
}
