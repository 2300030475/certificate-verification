
import "./EmployerVerify.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  FaSearch,
  FaArrowLeft,
  FaShieldAlt,
  FaFilePdf,
  FaQrcode,
} from "react-icons/fa";

function EmployerVerify() {
  const [certificateId, setCertificateId] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  // Display verification results
  const displayResult = useCallback((data) => {
    if (data.result === "CERTIFICATE NOT FOUND") {
      setResult({
        type: "not-found",
        title: "CERTIFICATE NOT FOUND",
        message:
          data.message || "No registered certificate was found.",
      });
      return;
    }

    if (data.result === "VERIFIED") {
      setResult({
        type: "verified",
        title: "VERIFIED",
        message:
          "The certificate matches the trusted certificate record.",
        certificate: data,
      });
      return;
    }

    if (data.result === "NOT VERIFIED / TAMPERED") {
      setResult({
        type: "tampered",
        title: "NOT VERIFIED / TAMPERED",
        message:
          "The certificate does not match the trusted certificate hash.",
        certificate: data,
      });
      return;
    }

    setResult({
      type: "error",
      title: "Verification Error",
      message: data.message || "Unexpected verification response.",
    });
  }, []);

  // QR code verification
  const handleQRVerification = useCallback(async (decodedText) => {
    setLoading(true);
    setResult(null);

    try {
      const scannedURL = new URL(decodedText);

      const expectedHost = "beige-rare-gibbon-882.mypinata.cloud";

      if (
        scannedURL.hostname !== expectedHost ||
        !scannedURL.pathname.startsWith("/ipfs/")
      ) {
        throw new Error("Invalid certificate QR code.");
      }

      const cid = scannedURL.pathname
        .split("/ipfs/")[1]
        .split("/")[0];

      if (!/^[a-zA-Z0-9]{20,120}$/.test(cid)) {
        throw new Error("Invalid IPFS CID in the QR code.");
      }

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in before verifying certificates.");
      }

      const response = await fetch(
        "http://localhost:8081/api/verification/verify-by-qr",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            ipfsCid: cid,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "QR verification failed."
        );
      }

      displayResult(data);

    } catch (error) {
      console.error("QR verification error:", error);

      setResult({
        type: "error",
        title: "QR Verification Error",
        message:
          error.message || "Unable to verify the scanned QR code.",
      });

    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  }, [displayResult]);

  // Start and stop QR scanner
  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 15,
        qrbox: { width: 320, height: 320 },
        aspectRatio: 1.0,
        rememberLastUsedCamera: true,
        supportedScanTypes: [0],
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        if (processingRef.current) return;

        processingRef.current = true;
        setScanning(false);

        handleQRVerification(decodedText);
      },
      () => {
        // Ignore repeated scanning errors.
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Scanner cleanup error:", error);
        });

        scannerRef.current = null;
      }
    };
  }, [scanning, handleQRVerification]);

  // Manual certificate verification
  const handleVerify = async (e) => {
    e.preventDefault();

    if (!certificateId.trim()) {
      setResult({
        type: "error",
        title: "Certificate ID Required",
        message: "Please enter a certificate ID.",
      });
      return;
    }

    if (!certificateFile) {
      setResult({
        type: "error",
        title: "Certificate PDF Required",
        message: "Please upload the certificate PDF.",
      });
      return;
    }

    if (certificateFile.type !== "application/pdf") {
      setResult({
        type: "error",
        title: "Invalid File",
        message: "Only PDF certificate files are allowed.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("certificateNumber", certificateId.trim());
      formData.append("certificateFile", certificateFile);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in before verifying certificates.");
      }

      const response = await fetch(
        "http://localhost:8081/api/verification/verify",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to verify certificate."
        );
      }

      displayResult(data);

    } catch (error) {
      console.error("Manual verification error:", error);

      setResult({
        type: "error",
        title: "Verification Error",
        message:
          error.message || "Unable to connect to the server.",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employer-verify">

      {/* Header */}
      <div className="employer-verify-header">
        <div>
          <h1>Verify Certificate</h1>
          <p>
            Verify academic certificates manually or by scanning QR codes.
          </p>
        </div>

        <button
          className="back-dashboard-btn"
          onClick={() => {
            window.location.href = "/employer-dashboard";
          }}
        >
          <FaArrowLeft />
          Dashboard
        </button>
      </div>

      {/* QR Scanner Section */}
      <div className="employer-verify-card">

        <div className="verify-main-icon">
          <FaQrcode />
        </div>

        <h2>Scan Certificate QR Code</h2>

        <p className="verify-description">
          Scan the QR code printed on the certificate to verify its
          registered IPFS document.
        </p>

        {!scanning ? (
          <button
            type="button"
            className="verify-button"
            onClick={() => {
              setResult(null);
              processingRef.current = false;
              setScanning(true);
            }}
            disabled={loading}
          >
            <FaQrcode />
            Scan QR Code
          </button>
        ) : (
          <div
            id="qr-reader"
            style={{
              width: "100%",
              marginTop: "20px",
            }}
          />
        )}

      </div>

      {/* Manual Verification Section */}
      <div className="employer-verify-card">

        <div className="verify-main-icon">
          <FaShieldAlt />
        </div>

        <h2>Manual Certificate Verification</h2>

        <p className="verify-description">
          Enter the certificate ID and upload the certificate PDF
          to verify its authenticity using SHA-256 hash comparison.
        </p>

        <form onSubmit={handleVerify}>

          {/* Certificate ID */}
          <div className="verify-input-group">

            <label htmlFor="certificateId">
              Certificate ID
            </label>

            <div className="verify-input-box">

              <FaSearch className="verify-input-icon" />

              <input
                id="certificateId"
                type="text"
                placeholder="Enter certificate ID"
                value={certificateId}
                onChange={(e) => {
                  setCertificateId(e.target.value);
                  setResult(null);
                }}
              />

            </div>
          </div>

          {/* Certificate PDF */}
          <div className="verify-input-group">

            <label htmlFor="certificateFile">
              Certificate PDF
            </label>

            <div className="certificate-file-box">

              <FaFilePdf className="certificate-file-icon" />

              <input
                id="certificateFile"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  setCertificateFile(e.target.files[0] || null);
                  setResult(null);
                }}
              />

            </div>

            {certificateFile && (
              <p className="selected-file">
                Selected file: {certificateFile.name}
              </p>
            )}

          </div>

          {/* Verify Button */}
          <button
            type="submit"
            className="verify-button"
            disabled={loading}
          >
            {loading ? (
              "Verifying..."
            ) : (
              <>
                <FaSearch />
                Verify Certificate
              </>
            )}
          </button>

        </form>
      </div>

      {/* Verification Result */}
      {result && (
        <div className={`verification-result ${result.type}`}>

          <div className="result-title">
            {result.title}
          </div>

          <p>{result.message}</p>

          {result.certificate && (
            <div className="certificate-details">

              <div>
                <span>Certificate ID</span>
                <strong>
                  {result.certificate.certificateNumber}
                </strong>
              </div>

              <div>
                <span>Student ID</span>
                <strong>
                  {result.certificate.studentId}
                </strong>
              </div>

              <div>
                <span>Student Name</span>
                <strong>
                  {result.certificate.studentName}
                </strong>
              </div>

              <div>
                <span>Stored Certificate Hash</span>
                <strong className="hash-value">
                  {result.certificate.certificateHash}
                </strong>
              </div>

              <div>
                <span>Verified Certificate Hash</span>
                <strong className="hash-value">
                  {result.certificate.verifiedHash}
                </strong>
              </div>

              <div>
                <span>IPFS CID</span>
                <strong className="hash-value">
                  {result.certificate.ipfsCid}
                </strong>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Verification Information */}
      <div className="verification-info">

        <h2>Verification Results</h2>

        <div className="result-info-grid">

          <div className="result-info verified-info">
            <strong>VERIFIED</strong>
            <p>
              The certificate hash matches the trusted certificate record.
            </p>
          </div>

          <div className="result-info tampered-info">
            <strong>NOT VERIFIED / TAMPERED</strong>
            <p>
              The certificate hash does not match the trusted record.
            </p>
          </div>

          <div className="result-info not-found-info">
            <strong>CERTIFICATE NOT FOUND</strong>
            <p>
              No registered certificate was found for the scanned CID
              or entered ID.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default EmployerVerify;
