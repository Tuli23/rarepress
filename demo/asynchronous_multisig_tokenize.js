const Rarepress = require('../index');
(async () => {
  // 1. initialize
  const rarepress = new Rarepress({ network: "rinkeby" });
  await rarepress.init()
  // 2. Add to nebulus
  let cid = await rarepress.add("https://thisartworkdoesnotexist.com")

  // 3. save alice address
  let alice = rarepress.wallet.address
  console.log("alice = ", alice)

  // 4. switch to bob 
  await rarepress.wallet.switch("m'/44'/60'/0'/0/1")
  let bob = rarepress.wallet.address
  console.log("bob = ", bob)

  // 5. build token with both alice and bob address
  let token = await rarepress.token.build({
    metadata: {
      name: "🍞",
      description: "bread",
      image: "/ipfs/" + cid
    },
    creators: [
      { account: alice, value: 5000 },
      { account: bob, value: 5000 }
    ],
    supply: 100
  })
  // 6. sign token with bob
  console.log("token wallet = ", rarepress.token.wallet)
  console.log("BUILT TOKEN", token)
  console.log("signing token", token)
  let signedToken = await rarepress.token.sign(token)
  console.log("## bob signed", signedToken)

  // 7. bob saves the token
  await rarepress.token.put(signedToken)

  // 8. switch back to alice
  await rarepress.wallet.switch("m'/44'/60'/0'/0/0")

  // 9. alice finds bob's saved token
  let foundToken = await rarepress.token.get({
    tokenId: signedToken.tokenId
  })
  console.log("Retrieved token = ", foundToken)

  // 10. co-sign bob's token with alice
  let multisigToken = await rarepress.token.sign(token, foundToken.signatures)
  console.log("## both alice and bob signed", multisigToken)

  // 11. save
  await rarepress.token.put(multisigToken)

  // 12. get the signature-merged token

  let fullySignedToken = await rarepress.token.get({ tokenId: multisigToken.tokenId })

  console.log("FULLY SIGNED", fullySignedToken)

  // 11. send token to rarible
//  let sent = await rarepress.token.send({ body: multisigToken })
//  console.log("sent", sent)
//  // 6. store token locally
//  await rarepress.token.put(multisigToken)
  // 7. build a trade position for the token
  /*
  let built = await rarepress.trade.build({
    who: {
      from: rarepress.wallet.address
    },
    what: {
      type: "ERC1155",
      id: sent.tokenId,
      value: 7
    },
    with: {
      type: "ETH",
      value: 42 * 10**18
    }
  })
  // 7. sign the trade
  let signedTrade = await rarepress.trade.sign(built)
  // 8. send the trade to rarible
  let tradeSent = await rarepress.trade.send({ body: signedTrade })
  console.log("tradeSent", tradeSent)
  */
})();
