const Mayor = artifacts.require("Mayor");
const truffleAssert = require("truffle-assertions");

contract("Mayor", (accounts) => {
  let quorum;
  let candidate;
  let escrow;

  before(() => {
    quorum = Math.floor(Math.random() * 10) + 1; // 0-9 random +1 => 1-10 random
    candidate = accounts[0];
    escrow = accounts[1];

    console.log("\t Quorum: " + quorum);
    console.log("\t Candidate: " + candidate);
    console.log("\t Escrow: " + escrow);
  });

  beforeEach(async () => {
    instance = await Mayor.new(candidate, escrow, quorum);
  });

  it("should be able to cast envelope", async () => {
    const envelops = await instance.compute_envelope(1, true, 5000);
    const result = await instance.cast_envelope(envelops);
    truffleAssert.eventEmitted(result, "EnvelopeCast");
  });

  it("should not open envelope before the quorum is reached ", async () => {
    const envelops = await instance.compute_envelope(1, true, 5000);
    await instance.cast_envelope(envelops);
    await truffleAssert.fails(
      instance.open_envelope.call(1, true, { value: 5000 })
    );
  });

  it("should be able to open envelope after reaching quorum", async () => {
    for (let i = 0; i < quorum; i++) {
      const envelops = await instance.compute_envelope(
        i + 1,
        (i + 1) % 2 == 0 ? true : false,
        (i + 1) * 5000
      );
      await instance.cast_envelope(envelops, { from: accounts[i + 2] });
    }
    const result = await instance.open_envelope.sendTransaction(1, false, {
      from: accounts[2],
      value: 5000,
    });
    truffleAssert.eventEmitted(result, "EnvelopeOpen");
  });

  it("should be able to open envelop - NewMayor scenario", async () => {
    for (let i = 0; i < quorum; i++) {
      const envelops = await instance.compute_envelope(
        i + 1,
        true,
        (i + 1) * 5000
      );
      await instance.cast_envelope(envelops, { from: accounts[i + 3] });
    }

    for (let i = 0; i < quorum; i++) {
      await instance.open_envelope.sendTransaction(i + 1, true, {
        from: accounts[i + 3],
        value: (i + 1) * 5000,
      });
    }
    const result = await instance.mayor_or_sayonara();
    truffleAssert.eventEmitted(result, "NewMayor");
  });

  it("should be able to open envelop - NewMayor scenario", async () => {
    for (let i = 0; i < quorum; i++) {
      const envelops = await instance.compute_envelope(
        i + 1,
        false,
        (i + 1) * 5000
      );
      await instance.cast_envelope(envelops, { from: accounts[i + 3] });
    }

    for (let i = 0; i < quorum; i++) {
      await instance.open_envelope.sendTransaction(i + 1, false, {
        from: accounts[i + 3],
        value: (i + 1) * 5000,
      });
    }
    const result = await instance.mayor_or_sayonara();
    truffleAssert.eventEmitted(result, "Sayonara");
  });
});
