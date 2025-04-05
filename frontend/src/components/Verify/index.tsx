import {
  MiniKit,
  VerificationLevel,
  ISuccessResult,
  MiniAppVerifyActionErrorPayload,
  IVerifyResponse,
} from "@worldcoin/minikit-js";
import { useCallback, useState } from "react";

export type VerifyCommandInput = {
  action: string;
  signal?: string;
  verification_level?: VerificationLevel; // Default: Orb
};

const verifyPayload: VerifyCommandInput = {
  action: "test-action", // This is your action ID from the Developer Portal
  signal: "",
  verification_level: VerificationLevel.Orb, // Orb | Device
};

export const VerifyBlock = () => {
  const [handleVerifyResponse, setHandleVerifyResponse] = useState<
    MiniAppVerifyActionErrorPayload | IVerifyResponse | null
  >(null);

  const handleVerify = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      console.warn("Tried to invoke 'verify', but MiniKit is not installed.");
      return null;
    }

    console.log("WORKING")

    const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);
    // await MiniKit.commandsAsync.verify(verifyPayload);

    // const finalPayload:any = {
    //   status:"success",
    //   proof:"0x1b7f5fb670b3fd3bab974eab9fc8c09470801f92df98f47bd6acca59991a7dc7081adc3cd456b270c964073828a1cb5618a6ca35cfdfd38a16077dd8da04e05b22c06328bfbe505675b8cfa13e4605dee5a7189587950f82fa53e3d576928e0d0d98c4af44477293e867ff3d472a3ee3932ce9fe217d3a3d50c1960b8077f5190de96d072f91a83728e27e6e3b1a5368151e15ff30b9634fcef96b60b7c68c2b2e8d5c6b2e02b8b95ec3aa00bf5f379ff24667d1f73b8fa7bf207eff180518570a51faa9a892e603c97b0af7227dac53ae07778eae82884fb0d5ba8a88f3cd94229542412f46c910623f5d6a89b88704f41299b18bda39bc22295c166a3352e9","merkle_root":"0x2f1318c9e1d9243b33ce5f88d9ae071c5443b03cec203ee1601e8423927aff53","nullifier_hash":"0x19434b285875891ecd63e5ab8b72df29dee6374aca20e0048c2e918ce9a61c5e",
    //   verification_level: "orb",
    //   version: 1,
    // };

    console.log("FINAL PAYLOAD", JSON.stringify(finalPayload));

    // no need to verify if command errored
    if (finalPayload.status === "error") {
      console.log("Command error");
      console.log(finalPayload);

      setHandleVerifyResponse(finalPayload);
      return finalPayload;
    }

    console.log("NO ERROR TILL HERE", process.env.VITE_NEXTAUTH_URL, process.env.APP_ID, import.meta.env.VITE_NEXTAUTH_URL)

    // Verify the proof in the backend
    const verifyResponse = await fetch(
      `https://e428-111-235-226-130.ngrok-free.app/api/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult, // Parses only the fields we need to verify
          action: verifyPayload.action,
          signal: verifyPayload.signal, // Optional
        }),
      }
    );


    console.log("VERIFY RESPONSE", verifyResponse)

    // TODO: Handle Success!
    const verifyResponseJson = await verifyResponse.json();

    console.log("VERIFY RESPONSE JSON", verifyResponseJson)

    if (verifyResponseJson.status === 200) {
      console.log("Verification success!");
      console.log(finalPayload);
    }

    setHandleVerifyResponse(verifyResponseJson);
    return verifyResponseJson;
  }, []);

  return (
    <div>
      <h1>Verify Block</h1>
      <button className="bg-green-500 p-4" onClick={() => { console.log("test", process.env.VITE_NEXTAUTH_URL) }}>
        Test Verify
      </button>
      <span>{JSON.stringify(handleVerifyResponse, null, 2)}</span>
    </div>
  );
};
