'use client';

import { encodeKey } from "@/utils/nostrUtil";
import { hexToBytes } from "@noble/hashes/utils";
import { useLocalStorage } from "@uidotdev/usehooks";
import { getPublicKey } from "nostr-tools";
import { useMemo } from "react";

const Page = () => {
    const [skHex, setSkHex] = useLocalStorage("skHex", "");

    const nostrPk = useMemo(() => {
        const sk = hexToBytes(skHex);
        return encodeKey("npub", getPublicKey(sk).substring(2))
    }, [skHex]);

    const nostrSk = useMemo(() => {
        return encodeKey("nsec", skHex.substring(2))
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
            </div>
        </div>
    )
}

export default Page;