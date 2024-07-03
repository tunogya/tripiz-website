'use client';

import { decodeKey, encodeKey } from "@/utils/nostrUtil";
import { hexToBytes } from "@noble/hashes/utils";
import { useLocalStorage } from "@uidotdev/usehooks";
import { getPublicKey } from "nostr-tools";
import { useMemo, useState } from "react";
import QRCode from "react-qr-code";

const Page = () => {
  const [skHex, setSkHex] = useLocalStorage("skHex", "");
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  const nostrPk = useMemo(() => {
    if (!skHex) {
      return null;
    }
    const sk = hexToBytes(skHex);
    const pubkey = getPublicKey(sk);
    return encodeKey("npub", pubkey);
  }, [skHex]);

  const nostrSk = useMemo(() => {
    if (!skHex) {
      return null;
    }
    return encodeKey("nsec", skHex)
  }, [skHex]);

  return (
    <div className="px-6">
      <div className="text-2xl py-2">
        Account
      </div>
      <div className="space-y-3 mt-3">
        <div>
          <div className="">
            Public Key
          </div>
          <div className="text-[#B3B3B3] text-sm">
            {nostrPk}
          </div>
        </div>
        <div>
          <div className="">
            Secret Key
          </div>
          <div className="text-[#B3B3B3] text-sm">
            {nostrSk}
          </div>
        </div>
        <div>
          <div className="p-2 bg-white w-fit space-y-2">
            <QRCode value={nostrSk || ""} size={256} />
            <div className="text-black text-center font-medium text-sm">
              Nostr Secret Key
            </div>
          </div>
        </div>
        <div className="pt-8">
          <div>What is Nostr?</div>
          <div className="text-[#B3B3B3] text-sm">
            Nostr is a simple, open protocol that enables global, decentralized, and censorship-resistant social media.
          </div>
        </div>
        <div className="">
          <div>I already have a Nostr account</div>
          <button
            onClick={() => setShowInput(!showInput)}
            className="text-[#1ED760] text-sm">
            Import my Nostr Secret Key
          </button>
          <div>
            {
              showInput && (
                <div className="flex flex-row space-x-3 items-center mt-1">
                  <input
                    value={input}
                    placeholder="Paste your Nostr Secret Key here"
                    onChange={(e) => setInput(e.target.value)}
                    className="w-[400px] px-4 py-3 bg-[#242424] text-white rounded-full outline-none"
                  />
                  <button
                    disabled={!input}
                    onClick={() => {
                      const nostrPrivateKey = decodeKey(input);
                      if (!nostrPrivateKey) {
                        return;
                      }
                      setSkHex(nostrPrivateKey);
                      setShowInput(false);
                      setInput("");
                    }}
                    className="bg-[#1ED760] py-3 px-6 rounded-full text-black font-medium disabled:bg-[#B3B3B3]">
                    Import
                  </button>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page;