import { expect } from "chai";
import { ethers } from "hardhat";
import { AirHockey } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("AirHockey", function () {
  let airHockey: AirHockey;
  let owner: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;
  let player3: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();
    const AirHockeyFactory = await ethers.getContractFactory("AirHockey");
    airHockey = await AirHockeyFactory.deploy();
  });

  describe("Game Creation", function () {
    it("creates a game with correct initial state", async function () {
      await airHockey.connect(player1).createGame("ROOM-ABC");

      const game = await airHockey.getGame(1);
      expect(game.id).to.equal(1);
      expect(game.creator).to.equal(player1.address);
      expect(game.opponent).to.equal(ethers.ZeroAddress);
      expect(game.status).to.equal(0); // Waiting
      expect(game.winner).to.equal(ethers.ZeroAddress);
      expect(game.player1Score).to.equal(0);
      expect(game.player2Score).to.equal(0);
      expect(game.roomCode).to.equal("ROOM-ABC");
    });

    it("emits GameCreated event", async function () {
      await expect(airHockey.connect(player1).createGame("ROOM-ABC"))
        .to.emit(airHockey, "GameCreated")
        .withArgs(1, player1.address, "ROOM-ABC");
    });

    it("increments nextGameId", async function () {
      await airHockey.connect(player1).createGame("ROOM-1");
      await airHockey.connect(player1).createGame("ROOM-2");

      expect(await airHockey.nextGameId()).to.equal(3);

      const game1 = await airHockey.getGame(1);
      const game2 = await airHockey.getGame(2);
      expect(game1.roomCode).to.equal("ROOM-1");
      expect(game2.roomCode).to.equal("ROOM-2");
    });

    it("maps room code to game id", async function () {
      await airHockey.connect(player1).createGame("ROOM-XYZ");

      const game = await airHockey.getGameByRoomCode("ROOM-XYZ");
      expect(game.creator).to.equal(player1.address);
      expect(game.roomCode).to.equal("ROOM-XYZ");
    });

    it("starts nextGameId at 1", async function () {
      expect(await airHockey.nextGameId()).to.equal(1);
    });
  });

  describe("Room Code Uniqueness", function () {
    it("prevents creating a game with a room code already in use", async function () {
      await airHockey.connect(player1).createGame("ROOM-DUP");

      await expect(
        airHockey.connect(player2).createGame("ROOM-DUP")
      ).to.be.revertedWith("Room code in use");
    });

    it("allows reusing a room code after cancellation", async function () {
      await airHockey.connect(player1).createGame("ROOM-REUSE");
      await airHockey.connect(player1).cancelGame(1);

      await expect(
        airHockey.connect(player2).createGame("ROOM-REUSE")
      ).to.not.be.reverted;
    });

    it("allows reusing a room code after game completion", async function () {
      await airHockey.connect(player1).createGame("ROOM-DONE");
      await airHockey.connect(player2).joinGame(1);
      await airHockey.connect(owner).submitResult(1, 7, 3);

      await expect(
        airHockey.connect(player1).createGame("ROOM-DONE")
      ).to.not.be.reverted;
    });
  });

  describe("Joining a Game", function () {
    beforeEach(async function () {
      await airHockey.connect(player1).createGame("ROOM-JOIN");
    });

    it("sets opponent and changes status to Active", async function () {
      await airHockey.connect(player2).joinGame(1);

      const game = await airHockey.getGame(1);
      expect(game.opponent).to.equal(player2.address);
      expect(game.status).to.equal(1); // Active
    });

    it("emits GameJoined event", async function () {
      await expect(airHockey.connect(player2).joinGame(1))
        .to.emit(airHockey, "GameJoined")
        .withArgs(1, player2.address);
    });

    it("prevents joining own game", async function () {
      await expect(
        airHockey.connect(player1).joinGame(1)
      ).to.be.revertedWith("Cannot join own game");
    });

    it("prevents joining a non-waiting game", async function () {
      await airHockey.connect(player2).joinGame(1);

      await expect(
        airHockey.connect(player3).joinGame(1)
      ).to.be.revertedWith("Game not available");
    });

    it("prevents joining a cancelled game", async function () {
      await airHockey.connect(player1).cancelGame(1);

      await expect(
        airHockey.connect(player2).joinGame(1)
      ).to.be.revertedWith("Game not available");
    });
  });

  describe("Submitting Results", function () {
    beforeEach(async function () {
      await airHockey.connect(player1).createGame("ROOM-RESULT");
      await airHockey.connect(player2).joinGame(1);
    });

    it("sets scores and winner correctly when player1 wins", async function () {
      await airHockey.connect(owner).submitResult(1, 7, 3);

      const game = await airHockey.getGame(1);
      expect(game.player1Score).to.equal(7);
      expect(game.player2Score).to.equal(3);
      expect(game.winner).to.equal(player1.address);
      expect(game.status).to.equal(2); // Completed
    });

    it("sets winner correctly when player2 wins", async function () {
      await airHockey.connect(owner).submitResult(1, 2, 7);

      const game = await airHockey.getGame(1);
      expect(game.winner).to.equal(player2.address);
    });

    it("updates player stats correctly", async function () {
      await airHockey.connect(owner).submitResult(1, 7, 3);

      const stats1 = await airHockey.getPlayerStats(player1.address);
      expect(stats1.gamesPlayed).to.equal(1);
      expect(stats1.wins).to.equal(1);
      expect(stats1.losses).to.equal(0);

      const stats2 = await airHockey.getPlayerStats(player2.address);
      expect(stats2.gamesPlayed).to.equal(1);
      expect(stats2.wins).to.equal(0);
      expect(stats2.losses).to.equal(1);
    });

    it("emits GameCompleted event", async function () {
      await expect(airHockey.connect(owner).submitResult(1, 7, 3))
        .to.emit(airHockey, "GameCompleted")
        .withArgs(1, player1.address, 7, 3);
    });

    it("prevents non-oracle from submitting", async function () {
      await expect(
        airHockey.connect(player1).submitResult(1, 7, 3)
      ).to.be.revertedWith("Not oracle");

      await expect(
        airHockey.connect(player2).submitResult(1, 7, 3)
      ).to.be.revertedWith("Not oracle");

      await expect(
        airHockey.connect(player3).submitResult(1, 7, 3)
      ).to.be.revertedWith("Not oracle");
    });

    it("prevents submitting for non-active game", async function () {
      await airHockey.connect(owner).submitResult(1, 7, 3);

      await expect(
        airHockey.connect(owner).submitResult(1, 5, 2)
      ).to.be.revertedWith("Game not active");
    });

    it("prevents submitting for a waiting game", async function () {
      await airHockey.connect(player1).createGame("ROOM-WAIT");

      await expect(
        airHockey.connect(owner).submitResult(2, 7, 3)
      ).to.be.revertedWith("Game not active");
    });
  });

  describe("Score Bounds", function () {
    beforeEach(async function () {
      await airHockey.connect(player1).createGame("ROOM-BOUNDS");
      await airHockey.connect(player2).joinGame(1);
    });

    it("rejects p1Score greater than 10", async function () {
      await expect(
        airHockey.connect(owner).submitResult(1, 11, 3)
      ).to.be.revertedWith("Score out of bounds");
    });

    it("rejects p2Score greater than 10", async function () {
      await expect(
        airHockey.connect(owner).submitResult(1, 3, 11)
      ).to.be.revertedWith("Score out of bounds");
    });

    it("allows maximum valid scores", async function () {
      await expect(
        airHockey.connect(owner).submitResult(1, 10, 9)
      ).to.not.be.reverted;
    });
  });

  describe("Tie Rejection", function () {
    beforeEach(async function () {
      await airHockey.connect(player1).createGame("ROOM-TIE");
      await airHockey.connect(player2).joinGame(1);
    });

    it("rejects equal scores", async function () {
      await expect(
        airHockey.connect(owner).submitResult(1, 5, 5)
      ).to.be.revertedWith("Tie not allowed");
    });

    it("rejects zero-zero tie", async function () {
      await expect(
        airHockey.connect(owner).submitResult(1, 0, 0)
      ).to.be.revertedWith("Tie not allowed");
    });
  });

  describe("Oracle Pattern", function () {
    it("sets deployer as initial oracle", async function () {
      expect(await airHockey.oracle()).to.equal(owner.address);
    });

    it("allows oracle to transfer role", async function () {
      await airHockey.connect(owner).setOracle(player1.address);
      expect(await airHockey.oracle()).to.equal(player1.address);
    });

    it("prevents non-oracle from calling setOracle", async function () {
      await expect(
        airHockey.connect(player1).setOracle(player2.address)
      ).to.be.revertedWith("Not oracle");
    });

    it("prevents setting oracle to zero address", async function () {
      await expect(
        airHockey.connect(owner).setOracle(ethers.ZeroAddress)
      ).to.be.revertedWith("Zero address");
    });

    it("new oracle can submit results", async function () {
      await airHockey.connect(owner).setOracle(player3.address);

      await airHockey.connect(player1).createGame("ROOM-ORACLE");
      await airHockey.connect(player2).joinGame(1);
      await airHockey.connect(player3).submitResult(1, 7, 3);

      const game = await airHockey.getGame(1);
      expect(game.status).to.equal(2); // Completed
    });
  });

  describe("Cancelling a Game", function () {
    beforeEach(async function () {
      await airHockey.connect(player1).createGame("ROOM-CANCEL");
    });

    it("cancels a waiting game", async function () {
      await airHockey.connect(player1).cancelGame(1);

      const game = await airHockey.getGame(1);
      expect(game.status).to.equal(3); // Cancelled
    });

    it("emits GameCancelled event", async function () {
      await expect(airHockey.connect(player1).cancelGame(1))
        .to.emit(airHockey, "GameCancelled")
        .withArgs(1);
    });

    it("prevents non-creator from cancelling", async function () {
      await expect(
        airHockey.connect(player2).cancelGame(1)
      ).to.be.revertedWith("Not creator");
    });

    it("prevents cancelling an active game", async function () {
      await airHockey.connect(player2).joinGame(1);

      await expect(
        airHockey.connect(player1).cancelGame(1)
      ).to.be.revertedWith("Cannot cancel");
    });

    it("prevents cancelling an already cancelled game", async function () {
      await airHockey.connect(player1).cancelGame(1);

      await expect(
        airHockey.connect(player1).cancelGame(1)
      ).to.be.revertedWith("Cannot cancel");
    });
  });

  describe("Game Expiry", function () {
    beforeEach(async function () {
      await airHockey.connect(player1).createGame("ROOM-EXPIRE");
    });

    it("expires a game after 24 hours", async function () {
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);

      await expect(airHockey.connect(player3).expireGame(1))
        .to.emit(airHockey, "GameExpired")
        .withArgs(1);

      const game = await airHockey.getGame(1);
      expect(game.status).to.equal(3); // Cancelled
    });

    it("frees room code on expiry", async function () {
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);

      await airHockey.connect(player3).expireGame(1);

      await expect(
        airHockey.connect(player2).createGame("ROOM-EXPIRE")
      ).to.not.be.reverted;
    });

    it("prevents expiring a game before 24 hours", async function () {
      await expect(
        airHockey.connect(player3).expireGame(1)
      ).to.be.revertedWith("Not expired");
    });

    it("prevents expiring an active game", async function () {
      await airHockey.connect(player2).joinGame(1);

      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        airHockey.connect(player3).expireGame(1)
      ).to.be.revertedWith("Game not waiting");
    });

    it("anyone can call expireGame", async function () {
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        airHockey.connect(player3).expireGame(1)
      ).to.not.be.reverted;
    });
  });

  describe("View Functions", function () {
    it("getGame returns correct data", async function () {
      await airHockey.connect(player1).createGame("ROOM-VIEW");

      const game = await airHockey.getGame(1);
      expect(game.id).to.equal(1);
      expect(game.creator).to.equal(player1.address);
      expect(game.roomCode).to.equal("ROOM-VIEW");
    });

    it("getPlayerStats returns zeroes for new player", async function () {
      const stats = await airHockey.getPlayerStats(player1.address);
      expect(stats.gamesPlayed).to.equal(0);
      expect(stats.wins).to.equal(0);
      expect(stats.losses).to.equal(0);
    });

    it("getGameByRoomCode returns correct game", async function () {
      await airHockey.connect(player1).createGame("UNIQUE-CODE");

      const game = await airHockey.getGameByRoomCode("UNIQUE-CODE");
      expect(game.creator).to.equal(player1.address);
    });

    it("getGameByRoomCode returns empty game for unknown code", async function () {
      const game = await airHockey.getGameByRoomCode("NONEXISTENT");
      expect(game.creator).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Edge Cases", function () {
    it("same player can create multiple games", async function () {
      await airHockey.connect(player1).createGame("ROOM-A");
      await airHockey.connect(player1).createGame("ROOM-B");

      const gameA = await airHockey.getGame(1);
      const gameB = await airHockey.getGame(2);
      expect(gameA.creator).to.equal(player1.address);
      expect(gameB.creator).to.equal(player1.address);
    });

    it("player stats accumulate across multiple games", async function () {
      // Game 1: player1 vs player2, player1 wins
      await airHockey.connect(player1).createGame("ROOM-G1");
      await airHockey.connect(player2).joinGame(1);
      await airHockey.connect(owner).submitResult(1, 7, 3);

      // Game 2: player1 vs player2, player2 wins
      await airHockey.connect(player1).createGame("ROOM-G2");
      await airHockey.connect(player2).joinGame(2);
      await airHockey.connect(owner).submitResult(2, 2, 7);

      // Game 3: player1 vs player3, player1 wins
      await airHockey.connect(player1).createGame("ROOM-G3");
      await airHockey.connect(player3).joinGame(3);
      await airHockey.connect(owner).submitResult(3, 7, 5);

      const stats1 = await airHockey.getPlayerStats(player1.address);
      expect(stats1.gamesPlayed).to.equal(3);
      expect(stats1.wins).to.equal(2);
      expect(stats1.losses).to.equal(1);

      const stats2 = await airHockey.getPlayerStats(player2.address);
      expect(stats2.gamesPlayed).to.equal(2);
      expect(stats2.wins).to.equal(1);
      expect(stats2.losses).to.equal(1);

      const stats3 = await airHockey.getPlayerStats(player3.address);
      expect(stats3.gamesPlayed).to.equal(1);
      expect(stats3.wins).to.equal(0);
      expect(stats3.losses).to.equal(1);
    });
  });
});
