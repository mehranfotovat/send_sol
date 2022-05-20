import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SendSol } from "../target/types/send_sol";

describe("send_sol", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();
  
  const program = anchor.workspace.SendSol as Program<SendSol>;

  const user_one = anchor.web3.Keypair.generate();
  const user_two = anchor.web3.Keypair.generate();
  
  const lamport_amount = 20_000_000_000;
  const lamport_to_send = 5_000_000_000;

  it("Is initialized!", async () => {
    // find pda account
    const [pdaAccount, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("pda-account")],
      program.programId,
    )
    // init pda program
    const tx = await program.methods.initialize().accounts({user: provider.wallet.publicKey, pdaAccount: pdaAccount}).rpc();
    console.log("Your transaction signature", tx);
    // user one balance account
    await provider.connection.confirmTransaction (
      await provider.connection.requestAirdrop(user_one.publicKey, lamport_amount), "confirmed"
    );
    console.log(await provider.connection.getBalance(user_one.publicKey));
    // send solana to pda
    let tx_data = new anchor.web3.Transaction().add(anchor.web3.SystemProgram.transfer({
      fromPubkey: user_one.publicKey,
      toPubkey: pdaAccount,
      lamports: lamport_to_send
    }))
    
    await anchor.web3.sendAndConfirmTransaction(provider.connection, tx_data, [user_one]);

    let balance_user_one = await provider.connection.getBalance(user_one.publicKey);
    let balance_pda_account = await provider.connection.getBalance(pdaAccount);

    console.log(balance_user_one);
    console.log(balance_pda_account);
    console.log("-------------------------");
    // send solana from pda to account
    await program.methods.sendSolana().accounts({to: user_two.publicKey, pdaAccount: pdaAccount}).rpc();

    let balance_user_two = await provider.connection.getBalance(user_two.publicKey);
    let balance_pda_account_after = await provider.connection.getBalance(pdaAccount);

    console.log(balance_user_two);
    console.log(balance_pda_account_after);
  });
});