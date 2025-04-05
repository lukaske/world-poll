import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";

const sendPayment = async () => {
  try {
    const res = await fetch(
      import.meta.env.VITE_DEPLOYMENT_URL + "/api/initiate-payment",
      {
        method: "POST",
      }
    );

    const { id } = await res.json();

    console.log(id);

    const payload: PayCommandInput = {
      reference: id,
      to: "0x4c44a6a5af7206b27d37d49e896b67a086e80042", // Test address
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenToDecimals(0.1, Tokens.WLD).toString(),
        },
        {
          symbol: Tokens.USDCE,
          token_amount: tokenToDecimals(0.1, Tokens.USDCE).toString(),
        },
      ],
      description: "Watch this is a test",
    };
    if (MiniKit.isInstalled()) {
      return await MiniKit.commandsAsync.pay(payload);
    }
    return null;
  } catch (error: unknown) {
    console.log("Error sending payment", error);
    return null;
  }
};

const handlePay = async () => {
  if (!MiniKit.isInstalled()) {
    console.error("MiniKit is not installed");
    return;
  }
  const sendPaymentResponse = await sendPayment();
  const response = sendPaymentResponse?.finalPayload;
  if (!response) {
    return;
  }

  if (response.status == "success") {
    const res = await fetch(
      import.meta.env.VITE_DEPLOYMENT_URL + "/api/confirm-payment",
      {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: response, reference: response.reference }),
    });
    const payment = await res.json();
    if (payment.success) {
      // Congrats your payment was successful!
      console.log("SUCESS!");
    } else {
      // Payment failed
      console.log("FAILED!");
    }
  }
};

export const PayBlock = () => {
  return (
    <button className="bg-blue-500 p-4" onClick={handlePay}>
      Pay
    </button>
  );
};

export { handlePay };
