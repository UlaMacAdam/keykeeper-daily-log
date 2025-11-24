# Keykeeper - Private Encrypted To-do List

A privacy-first encrypted to-do list application built with FHEVM (Fully Homomorphic Encryption Virtual Machine) and React. Your todos are encrypted on-chain and only you can decrypt them.

## 🚀 Live Demo

- **Live Application**: [https://keykeeper-daily-log.vercel.app/](https://keykeeper-daily-log.vercel.app/)
- **Demo Video**: [https://github.com/fufu666-max/keykeeper-daily-log/blob/main/keykeeper-daily-log.mp4](https://github.com/fufu666-max/keykeeper-daily-log/blob/main/keykeeper-daily-log.mp4)

## Features

- 🔒 **End-to-End Encryption**: All todo items are encrypted using FHE before being stored on-chain
- 🔐 **Private by Design**: Only you can decrypt your todos using your wallet
- 📝 **Simple Interface**: Clean, modern UI for managing your encrypted todos
- 🌐 **Blockchain Storage**: Todos are stored on-chain with encrypted data
- 🎨 **Rainbow Wallet Integration**: Seamless wallet connection with RainbowKit

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Blockchain**: Hardhat + Ethers.js
- **Encryption**: FHEVM (Zama)
- **Wallet**: RainbowKit + Wagmi

## Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- Hardhat node running on localhost:8545 (for local development)

## Setup

### 1. Install Dependencies

```bash
# Install contract dependencies
npm install

# Install UI dependencies
cd ui
npm install
```

### 2. Deploy Contracts

#### Local Network

1. Start Hardhat node (in a separate terminal):
```bash
npx hardhat node
```

2. Deploy contracts (in another terminal):
```bash
npx hardhat deploy --network localhost
```

This will deploy the `PrivateTodoList` contract and display the contract address. The default address for localhost is usually:
```
PrivateTodoList contract: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 3. Configure Environment Variables

Create a `.env.local` file in the `ui` directory:

**Option 1: Copy from example**
```bash
cd ui
cp .env.example .env.local
```

**Option 2: Create manually**
Create `ui/.env.local` with:
```env
VITE_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```

**Note**: Replace the contract address with the actual address from step 2 if it's different. The WalletConnect Project ID is optional for local development.

#### Sepolia Testnet

1. Configure your `.env` file with:
   - `MNEMONIC`: Your wallet mnemonic
   - `INFURA_API_KEY`: Your Infura API key
   - `ETHERSCAN_API_KEY`: Your Etherscan API key (optional)

2. Deploy:
```bash
npx hardhat deploy --network sepolia
```

### 4. Run Tests

#### Local Tests
```bash
npx hardhat test
```

#### Sepolia Tests
```bash
npx hardhat test --network sepolia test/PrivateTodoListSepolia.ts
```

### 5. Start Development Server

```bash
cd ui
npm run dev
```

## Contract Overview

### PrivateTodoList.sol

The main contract that stores encrypted todos on-chain using FHEVM (Fully Homomorphic Encryption).

#### Contract Code Structure

```solidity
contract PrivateTodoList is SepoliaConfig {
    struct EncryptedTodo {
        euint32 id;           // Encrypted todo ID (hash of text content)
        euint32 completed;    // Encrypted completion status (0 = not completed, 1 = completed)
        uint256 timestamp;   // Plaintext timestamp for sorting
    }

    mapping(address => EncryptedTodo[]) private _userTodos;
    mapping(address => uint256) private _todoCount;
}
```

#### Key Functions

**1. `createTodo()`**
- **Purpose**: Create a new encrypted todo item
- **Parameters**:
  - `encryptedId` (externalEuint32): Encrypted hash of the todo text
  - `encryptedCompleted` (externalEuint32): Encrypted completion status (0 = not completed)
  - `idProof` (bytes): FHE input proof for encryptedId
  - `completedProof` (bytes): FHE input proof for encryptedCompleted
- **Process**:
  1. Converts external encrypted values to internal `euint32` using `FHE.fromExternal()`
  2. Creates a new `EncryptedTodo` struct with encrypted data and current timestamp
  3. Pushes to user's todo array and increments count
  4. Grants decryption permissions to the user via `FHE.allow()`
  5. Emits `TodoCreated` event

**2. `toggleTodo()`**
- **Purpose**: Toggle the completion status of a todo item
- **Parameters**:
  - `todoIndex` (uint256): Index of the todo to toggle
  - `encryptedCompleted` (externalEuint32): New encrypted completion status
  - `completedProof` (bytes): FHE input proof
- **Process**:
  1. Validates todo index exists
  2. Converts external encrypted value to `euint32`
  3. Updates the todo's completion status and timestamp
  4. Grants decryption permissions
  5. Emits `TodoToggled` event

**3. `getTodo()`**
- **Purpose**: Retrieve an encrypted todo by index
- **Returns**: `euint32 encryptedId`, `euint32 encryptedCompleted`, `uint256 timestamp`

**4. `getTodoCount()`**
- **Purpose**: Get the total number of todos for a user
- **Returns**: `uint256 count`

**5. `getTodoTimestamps()`**
- **Purpose**: Get all todo timestamps for sorting/display
- **Returns**: Array of `uint256` timestamps

#### Data Structure

- **`id` (euint32)**: Encrypted hash of the todo text (using `ethers.id()` and truncated to uint32)
- **`completed` (euint32)**: Encrypted completion status (0 = incomplete, 1 = complete)
- **`timestamp` (uint256)**: Plaintext timestamp for sorting (stored as `block.timestamp`)

## How It Works

### Encryption and Decryption Logic

#### 1. Creating a Todo (Encryption Flow)

**Step 1: Text Hashing**
```typescript
const hashTextToUint32 = (text: string): number => {
  const hash = ethers.id(text);  // Keccak256 hash
  const uint32 = BigInt(hash) & BigInt("0xFFFFFFFF");  // Truncate to uint32
  return Number(uint32);
};
```

**Step 2: FHE Encryption**
```typescript
// Encrypt todo ID (hashed text)
const encryptedIdInput = fhevmInstance.createEncryptedInput(
  contractAddress,
  userAddress
);
encryptedIdInput.add32(todoIdUint32);
const encryptedId = await encryptedIdInput.encrypt();

// Encrypt completion status (0 = not completed)
const encryptedCompletedInput = fhevmInstance.createEncryptedInput(
  contractAddress,
  userAddress
);
encryptedCompletedInput.add32(0);
const encryptedCompleted = await encryptedCompletedInput.encrypt();
```

**Step 3: On-Chain Storage**
- Encrypted data is sent to the contract via `createTodo()` function
- Contract stores `euint32` values on-chain
- Decryption permissions are granted to the user

**Step 4: Local Storage Mapping**
- Plaintext todo text is stored in browser's `localStorage`
- Key: Encrypted handle (hex string, lowercase)
- Value: Original todo text
- This mapping allows retrieval of plaintext after decryption

#### 2. Viewing Todos (Decryption Flow)

**Step 1: Load Encrypted Todos**
- Fetch encrypted todos from contract using `getTodo()` and `getTodoCount()`
- Initially display as "Encrypted Todo #X" if text mapping not found

**Step 2: Batch Decryption**
```typescript
// Collect all handles for batch decryption
const handleContractPairs = [];
for (const todo of todos) {
  handleContractPairs.push({
    handle: todo.encryptedId,
    contractAddress: contractAddress
  });
  handleContractPairs.push({
    handle: todo.encryptedCompleted,
    contractAddress: contractAddress
  });
}

// Generate keypair and EIP712 signature (once for all decryptions)
const keypair = fhevmInstance.generateKeypair();
const eip712 = fhevmInstance.createEIP712(
  keypair.publicKey,
  [contractAddress],
  startTimestamp,
  durationDays
);
const signature = await signer.signTypedData(...);

// Batch decrypt all handles at once
const decryptedResult = await fhevmInstance.userDecrypt(
  handleContractPairs,
  keypair.privateKey,
  keypair.publicKey,
  signature,
  contractAddresses,
  userAddress,
  startTimestamp,
  durationDays
);
```

**Step 3: Text Retrieval**
- Use decrypted hash (ID) to look up plaintext text from `localStorage`
- If mapping exists, display the original text
- If not found, display generic "Todo #X"

**Step 4: Status Update**
- Decrypted completion status (0 or 1) is converted to boolean
- Status is saved to `completedMap` in `localStorage` for persistence
- UI updates to show decrypted todos

#### 3. Toggling Completion

**Step 1: Fetch Current Status**
- Read current encrypted completion status from contract

**Step 2: Encrypt New Status**
```typescript
// Encrypt new completion status (1 if currently 0, 0 if currently 1)
const newStatus = currentStatus === 0 ? 1 : 0;
const encryptedCompletedInput = fhevmInstance.createEncryptedInput(
  contractAddress,
  userAddress
);
encryptedCompletedInput.add32(newStatus);
const encryptedCompleted = await encryptedCompletedInput.encrypt();
```

**Step 3: Update On-Chain**
- Send encrypted status to contract via `toggleTodo()`
- Contract updates the todo's completion status
- Optimistic UI update for immediate feedback

**Step 4: Persist Locally**
- Update `completedMap` in `localStorage` immediately
- Ensures status persists across page refreshes

### Key Design Decisions

1. **Hashing Before Encryption**: Todo text is hashed to `uint32` before encryption to reduce encryption overhead and ensure consistent ID representation.

2. **Local Storage Mapping**: Plaintext text is stored locally because:
   - FHEVM encrypts numerical values, not strings
   - The hash alone cannot be reversed to original text
   - This allows users to see their original todo text after decryption

3. **Batch Decryption**: All todos are decrypted in a single operation with one signature to improve UX and reduce wallet interactions.

4. **Status Persistence**: Completion status is stored in `localStorage` to ensure it persists across page refreshes, even before decryption.

5. **Optimistic Updates**: UI updates immediately when toggling completion, before blockchain confirmation, for better responsiveness.

## Project Structure

```
keykeeper-daily-log/
├── contracts/
│   └── PrivateTodoList.sol      # Main contract
├── test/
│   ├── PrivateTodoList.ts       # Local tests
│   └── PrivateTodoListSepolia.ts # Sepolia tests
├── tasks/
│   └── PrivateTodoList.ts       # Hardhat tasks
├── ui/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── hooks/
│   │   │   └── useTodoList.tsx  # Main hook for todo operations
│   │   ├── fhevm/               # FHEVM utilities
│   │   └── pages/
│   │       └── Index.tsx        # Main page
│   └── public/
│       └── favicon.svg          # App icon
└── README.md
```

## Development

### Compile Contracts
```bash
npx hardhat compile
```

### Run Tests
```bash
npx hardhat test
```

### Type Generation
```bash
npx hardhat typechain
```

## Git and GitHub

### Initial Setup

The repository is already configured with:
- Remote: `https://github.com/UlaMacAdam/keykeeper-daily-log.git`
- User: `UlaMacAdam`
- Email: `xpmrgq3126972@outlook.com`

### Pushing Changes to GitHub

#### Option 1: Using PowerShell Script (Windows)

```powershell
.\push-to-github.ps1 "Your commit message"
```

#### Option 2: Using Bash Script (Linux/Mac)

```bash
chmod +x push-to-github.sh
./push-to-github.sh "Your commit message"
```

#### Option 3: Manual Git Commands

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Automatic Push

The repository includes a GitHub Actions workflow (`.github/workflows/auto-push.yml`) that will automatically build the project when changes are pushed to the main branch.

**Important Security Note**: The GitHub token in the remote URL is exposed. For security, you should:
1. Revoke the current token: https://github.com/settings/tokens
2. Generate a new token with appropriate permissions
3. Update the remote URL: `git remote set-url origin https://YOUR_NEW_TOKEN@github.com/UlaMacAdam/keykeeper-daily-log.git`

## License

MIT
