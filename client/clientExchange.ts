import { PublicKey, SystemProgram } from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";

console.log("My address:", pg.wallet.publicKey.toString());
const balance = await pg.connection.getBalance(pg.wallet.publicKey);
console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);


const taker = pg.wallet.publicKey
const initializer = new PublicKey('fox6txwHkEBHnJ6vgXX7ErWSZnVmPbR2XMSKnhnfPsP'),
const mintA = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')
const mintB = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')

const [initializerAtaA, initializerAtaB, takerAtaA, takerAtaB] = [initializer, taker]
    .map((a) => [mintA, mintB].map((m) => getAssociatedTokenAddressSync(m, a)))
    .flat();

const seedI = initializer.toString().match(/\d+/g).join('')
const seedT = taker.toString().match(/\d+/g).join('')
const seedA = mintA.toString().match(/\d+/g).join('')
const seedB = mintB.toString().match(/\d+/g).join('')


const seed = new anchor.BN(seedI+seedT+seedA+seedB);

const escrow = PublicKey.findProgramAddressSync(
    [Buffer.from("state"), seed.toArrayLike(Buffer, "le", 8)],
    pg.PROGRAM_ID
  )[0];

const vault = getAssociatedTokenAddressSync(mintA, escrow, true);


const accounts = {
  initializer,
  taker: new PublicKey('foxvTN8VbxUzzWcvxEFZALhSWV1CPTXrzu9XMP8wPCW'),
  mintA,
  mintB,
  initializerAtaA,
  initializerAtaB,
  takerAtaA,
  takerAtaB,
  escrow,
  vault,
  associatedTokenprogram: ASSOCIATED_TOKEN_PROGRAM_ID,
  tokenProgram: TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
};

const initializerAmount = 1e6;
const takerAmount = 1e6;
   
await pg.program.methods
    .exchange()
    .accounts({ ...accounts })
    .signers([pg.wallet.keypair])
    .rpc()
    .then(confirm)
    .then(log);

async function confirm(signature: string) {
  const block = await pg.connection.getLatestBlockhash();
  await pg.connection.confirmTransaction({
    signature,
    ...block,
  });
  return signature;
}

async function log(signature: string) {
  console.log(
    `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${pg.connection.rpcEndpoint}`
  );
  return signature;
}