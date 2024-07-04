'use client';

import { encodeKey } from "@/utils/nostrUtil";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import { useEffect, useMemo, useState } from "react";

const useAccount = () => {
  const [skHex, setSkHex] = useState("");

  const pubkey = useMemo(() => {
    if (!skHex) {
      return "";
    }
    const sk = hexToBytes(skHex);
    return getPublicKey(sk);
  }, [skHex]);
  
  const register = () => {
    let sk = generateSecretKey() // `sk` is a Uint8Array
    // let pk = getPublicKey(sk) // `pk` is a hex string
    let skHex = bytesToHex(sk)
    // let backToBytes = hexToBytes(skHex)
    setSkHex(skHex);
    window.localStorage.setItem("skHex", skHex);
  }

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
    return encodeKey("nsec", skHex);
  }, [skHex]);

  useEffect(() => {
    const sk = window.localStorage.getItem("skHex");
    if (sk) {
      setSkHex(sk);
    } else {
      register();
    }
  }, []);

  return {
    skHex,
    pubkey,
    nostrPk,
    nostrSk,
  }
}

export default useAccount;