const Mayor = artifacts.require("MayorMultipleCandidates");
const truffleAssert = require("truffle-assertions");

contract("MayorMultipleCandidates", (accounts) => {
  let quorum;
  let candidates;
  let escrow;

  before(() => {
    quorum = 12; //Math.floor(Math.random() * 10) + 1; // 0-9 random +1 => 1-10 random
    candidates = accounts.slice(0, 3); // first 3 accounts as candidates account
    escrow = accounts[3]; // 4th account as escrow

    console.log("\t Quorum: " + quorum);
    console.log("\t Candidate: " + candidates);
    console.log("\t Escrow: " + escrow);
  });

  //   after(() => {
  //     console.log("\t Quorum: " + quorum);
  //     console.log("\t Candidate: " + candidates);
  //     console.log("\t Escrow: " + escrow);
  //   });

  beforeEach(async () => {
    instance = await Mayor.new(escrow, quorum);

    await instance.add_candidate.sendTransaction(candidates[0], {
      from: candidates[0],
      value: 100000,
    });
    await instance.add_candidate.sendTransaction(candidates[1], {
      from: candidates[1],
      value: 100000,
    });
    await instance.add_candidate.sendTransaction(candidates[2], {
      from: candidates[2],
      value: 100000,
    });
  });

  it("should be able to add the candidates", async () => {
    let count = await instance.get_candidate_count();
    expect(count.toNumber()).to.equal(3);
  });

  it("should be able to cast envelope", async () => {
    // compute_envelope(sigil, candidate_secret, soul)
    const envelops = await instance.compute_envelope(1, candidates[0], 5000);
    const result = await instance.cast_envelope(envelops);
    truffleAssert.eventEmitted(result, "EnvelopeCast");
  });

  it("should not open envelope before the quorum is reached ", async () => {
    const envelops = await instance.compute_envelope(1, candidates[0], 5000);
    await instance.cast_envelope(envelops);
    await truffleAssert.fails(
      instance.open_envelope.call(1, candidates[0], {
        from: accounts[4],
        value: 5000,
      })
    );
  });

  it("should be able to open envelope after reaching quorum", async () => {
    for (let i = 0; i < quorum; i++) {
      const envelops = await instance.compute_envelope(
        i + 1,
        candidates[0],
        (i + 1) * 5000
      );
      await instance.cast_envelope(envelops, { from: accounts[i + 3] });
    }
    // console.log(
    //   (await instance.get_candidate_vote_count(candidates[0])).toNumber()
    // );
    const result = await instance.open_envelope.sendTransaction(
      1,
      candidates[0],
      {
        from: accounts[3],
        value: 5000,
      }
    );
    // console.log(
    //   (await instance.get_candidate_vote_count(candidates[0])).toNumber(),
    //   "123123123"
    // );
    // console.log(candidates[0], await instance.get_candidate_using_idx(0));
    // console.log(candidates[1], await instance.get_candidate_using_idx(1));
    truffleAssert.eventEmitted(result, "EnvelopeOpen");
  });

  it("should be able to open envelop - Draw scenario", async () => {
    for (let i = 0; i < quorum; i++) {
      let idx = i % 2 === 0 ? 1 : 0;
      const envelops = await instance.compute_envelope(
        i + 1,
        candidates[idx],
        5000
      );
      await instance.cast_envelope(envelops, { from: accounts[i + 3] });
    }

    for (let i = 0; i < quorum; i++) {
      let idx = i % 2 === 0 ? 1 : 0;
      await instance.open_envelope.sendTransaction(i + 1, candidates[idx], {
        from: accounts[i + 3],
        value: 5000,
      });
    }
    let result = await instance.mayor_or_sayonara();

    truffleAssert.eventEmitted(result, "Drawn");
    // console.log(
    //   result[0].toNumber(),
    //   result[1],
    //   result[2].toNumber(),
    //   result[3],
    //   "qweqweqeqw"
    // );
  });

  it("should be able to open envelop - Winner scenario", async () => {
    for (let i = 0; i < quorum; i++) {
      let idx = i % 2 === 0 ? 1 : i % 3 === 0 ? 2 : 0;
      const envelops = await instance.compute_envelope(
        i + 1,
        candidates[idx],
        (i + 1) * 5000
      );
      await instance.cast_envelope(envelops, { from: accounts[i + 3] });
    }

    for (let i = 0; i < quorum; i++) {
      let idx = i % 2 === 0 ? 1 : i % 3 === 0 ? 2 : 0;
      await instance.open_envelope.sendTransaction(i + 1, candidates[idx], {
        from: accounts[i + 3],
        value: (i + 1) * 5000,
      });
    }
    let result = await instance.mayor_or_sayonara();

    truffleAssert.eventEmitted(result, "NewMayor");
    // console.log(
    //   result[0].toNumber(),
    //   result[1],
    //   result[2].toNumber(),
    //   result[3],
    //   "qweqweqeqw"
    // );
    //   console.log("\t Gas Used: " + result.receipt.gasUsed);
    //   truffleAssert.eventEmitted(result, "Sayonara");
  });
});
