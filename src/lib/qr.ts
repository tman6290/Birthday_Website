import "server-only";
import QRCode from "qrcode";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export const passUrl = (token: string) => `${siteUrl()}/p/${token}`;

export function qrPng(token: string) {
  return QRCode.toBuffer(passUrl(token), {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 600,
    color: { dark: "#2B2220", light: "#FFFFFF" },
  });
}
