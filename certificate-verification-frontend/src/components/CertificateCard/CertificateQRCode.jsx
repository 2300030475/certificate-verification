
import { QRCodeSVG } from "qrcode.react";

function CertificateQRCode({ certificateNumber, ipfsCid }) {
  if (!certificateNumber || !ipfsCid) {
    return <p>Certificate document is unavailable.</p>;
  }

  // Direct URL to the original certificate stored in IPFS
  const certificateUrl =
    `https://beige-rare-gibbon-882.mypinata.cloud/ipfs/${encodeURIComponent(ipfsCid)}`;

  const downloadQRCode = () => {
    const svg = document.getElementById(
      `certificate-qr-${encodeURIComponent(certificateNumber)}`
    );

    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    const blob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `certificate-${certificateNumber}-qr.svg`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="certificate-qr">
      <QRCodeSVG
        id={`certificate-qr-${encodeURIComponent(certificateNumber)}`}
        value={certificateUrl}
        size={140}
        level="M"
        includeMargin
      />

      <p>Certificate ID: {certificateNumber}</p>

      <button type="button" onClick={downloadQRCode}>
        Download QR Code
      </button>
    </div>
  );
}

export default CertificateQRCode;
