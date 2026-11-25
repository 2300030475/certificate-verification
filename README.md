# Blockchain-Based Academic Certificate Verification System

## 📌 Project Overview

The Blockchain-Based Academic Certificate Verification System is a web application designed to make academic certificate verification secure, transparent, and reliable.

The system uses blockchain technology and the InterPlanetary File System (IPFS) to store certificate verification records and documents. It allows universities to upload certificates, students to access their certificates, and employers to verify certificate authenticity using QR codes or manual document uploads.

The system uses SHA-256 hashing to detect certificate modifications and blockchain records to provide a tamper-resistant verification reference.

## 🎯 Objectives

- Prevent academic certificate forgery.
- Provide secure and reliable certificate verification.
- Store certificate documents using IPFS.
- Maintain certificate verification records on blockchain.
- Enable QR-code-based certificate verification.
- Reduce manual verification time for employers and institutions.

## 🚀 Key Features

### Admin / University
- Secure login and authentication.
- Upload and manage academic certificates.
- Generate unique certificate numbers.
- Generate QR codes for certificates.
- Store certificate documents on IPFS.
- Record certificate hashes on blockchain.

### Student
- Secure student login.
- View uploaded academic certificates.
- Access certificate documents.
- View and scan certificate QR codes.

### Employer
- Verify certificates through QR code scanning.
- Upload certificates for manual verification.
- Check certificate authenticity.
- View verification results and history.

## 🛠️ Technologies Used

| Component | Technology |
|---|---|
| Frontend | React.js, Vite |
| Backend | Java, Spring Boot |
| Database | MySQL |
| Blockchain | Solidity, Hardhat |
| Blockchain Integration | Web3j |
| File Storage | Pinata IPFS |
| Authentication | JWT, BCrypt |
| Hashing | SHA-256 |
| QR Scanner | html5-qrcode |

## 📂 Project Structure

```text
certificate-verification/
│
├── .gitignore
├── README.md
│
├── blockchain/
│   ├── contracts/
│   │   └── CertificateVerification.sol
│   ├── scripts/
│   │   └── deploy.ts
│   ├── hardhat.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── certificate-verification-backend/
│   └── certificate-verification-backend/
│       ├── src/
│       ├── pom.xml
│       ├── mvnw
│       └── mvnw.cmd
│
└── certificate-verification-frontend/
    ├── public/
    ├── src/
    ├── package.json
    └── vite.config.js
```

## ⚙️ Installation and Setup

### 1. Prerequisites

Install the following software:

- Node.js and npm
- Java JDK 17
- Apache Maven
- MySQL Server
- Git
- Visual Studio Code

### 2. Clone the Repository

```bash
git clone https://github.com/2300030475/certificate-verification.git
```

Navigate into the project:

```bash
cd certificate-verification
```

### 3. Configure the Database

Create the MySQL database:

```sql
CREATE DATABASE certificate_verification;
```

Configure your database connection, username, and password in the backend `application.properties` file.

Do not commit database passwords or API credentials.

### 4. Start the Blockchain

Open a terminal:

```bash
cd blockchain
npm install
```

Start the local Hardhat blockchain:

```bash
npx hardhat node
```

Keep this terminal running.

Open another terminal:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

Update the deployed smart contract address in the backend configuration wherever required.

### 5. Run the Backend

Open another terminal:

```bash
cd certificate-verification-backend/certificate-verification-backend
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

Backend default URL:

```text
http://localhost:8081
```

### 6. Run the Frontend

Open another terminal:

```bash
cd certificate-verification-frontend
