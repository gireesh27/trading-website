export const getOrderDetails = async (orderId: string) => {
  const res = await fetch(`/api/trading/orders/${orderId}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok || !data.success) {
    throw new Error(data?.error || "Failed to fetch order details");
  }

  return data.order;
};
