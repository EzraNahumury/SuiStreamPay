# StreamPay Frontend

Frontend for StreamPay, a pay-per-time PDF reading app on Sui. This FE handles wallet connection, on-chain content catalog, creator uploads to IPFS (via Pinata), and reading sessions that settle every 10 seconds.

**Tech Stack**
- Next.js App Router
- React 19
- @mysten/dapp-kit (wallet + Sui transactions)
- Tailwind CSS

**App Flow (FE)**
1. Landing page at `/` shows product info.
2. When the wallet is connected, the user is auto-redirected to `/catalog`.
3. The catalog lists on-chain content (Platform `contents`).
4. The user selects a content item and goes to `/content/[id]` to choose a deposit.
5. The user goes to `/reader/[id]` to start a reading session, checkpoint, top-up, and end.
6. Creators open `/creator` to upload PDFs to IPFS and publish metadata + on-chain listing.

**Operation Modes**
- On-chain mode is active when the wallet is connected and `NEXT_PUBLIC_PACKAGE_ID` + `NEXT_PUBLIC_PLATFORM_ID` are set.
- If not configured, the reader runs in demo mode (local timer), and the catalog will be empty.

**Main Routes**
- `/` Landing + auto-redirect when wallet is connected.
- `/catalog` On-chain content list.
- `/content/[id]` Content detail + deposit selection.
- `/reader/[id]` Reader + streaming session.
- `/creator` Creator console + upload.

**API Routes (Next.js)**
- `GET /api/content` Fetch all content from on-chain Platform.
- `GET /api/content/[id]` Fetch a single on-chain content item.
- `POST /api/pinata/upload` Upload PDF file to Pinata (requires `PINATA_JWT`).
- `POST /api/pinata/metadata` Pin JSON metadata to Pinata (requires `PINATA_JWT`).

**Environment Variables**
- `PINATA_JWT` Pinata JWT token (server-side). Required for uploads.
- `NEXT_PUBLIC_SUI_NETWORK` `testnet | devnet | mainnet | localnet`. Default `testnet`.
- `NEXT_PUBLIC_PACKAGE_ID` Package ID from smart contract deployment.
- `NEXT_PUBLIC_PLATFORM_ID` Platform object ID (required for on-chain catalog & sessions).
- `NEXT_PUBLIC_MODULE_NAME` Move module name, default `streampay_sc`.
- `NEXT_PUBLIC_ENABLE_BURNER` `true|false`, enable burner wallet.

**Local Setup**
1. `npm install`
2. Copy `.env.example` to `.env` and fill required values.
3. `npm run dev`
4. Open `http://localhost:3000`

**Reader Flow (On-chain)**
1. Pick content from the catalog.
2. Choose a deposit on the detail page.
3. Click `Read now` to open the reader.
4. Click `Start on-chain` to create a session.
5. Use `Checkpoint` or `Top up` as needed.
6. Click `End` to settle to the creator and refund the remaining balance.

**Creator Flow**
1. Connect wallet.
2. Fill title, description, rate/10s, then upload the PDF.
3. The FE uploads the file to Pinata and creates metadata.
4. The FE calls `create_content` in the smart contract to publish.

**Notes**
- The FE reads on-chain objects via Sui JSON RPC. If `NEXT_PUBLIC_PACKAGE_ID` / `NEXT_PUBLIC_PLATFORM_ID` are incorrect, the upload is rejected by platform verification.
- Deposit, top-up, and settlement are shown in `SUI` in the UI and converted to `Mist` for transactions.
