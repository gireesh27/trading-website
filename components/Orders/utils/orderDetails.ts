import { toast } from "@/components/ui/use-toast";

export const GetOrderDetails = async (orderId: string) => {
    try {
      const res = await fetch(`/api/trading/orders/${orderId}`, {
        method: "GET",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch order details");
      }

      toast({
        title: "Order Details Loaded",
        description: `Symbol: ${data.order.symbol} | Quantity: ${data.order.quantity}`,
      });

      return data.order;
    } catch (err: any) {
      console.error("❌ Error fetching order details:", err);
      toast({
        title: "Failed to load order details",
        description: err.message,
        variant: "destructive",
      });
      return null;
    }
  };