// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AirHockey {
    enum GameStatus { Waiting, Active, Completed, Cancelled }

    struct Game {
        uint256 id;
        address creator;
        address opponent;
        GameStatus status;
        address winner;
        uint8 player1Score;
        uint8 player2Score;
        string roomCode;
        uint256 createdAt;
    }

    struct PlayerStats {
        uint256 gamesPlayed;
        uint256 wins;
        uint256 losses;
    }

    address public oracle;
    uint256 public constant GAME_EXPIRY = 24 hours;

    mapping(uint256 => Game) public games;
    mapping(address => PlayerStats) public playerStats;
    mapping(string => uint256) public roomCodeToGameId;
    uint256 public nextGameId;

    event GameCreated(uint256 indexed gameId, address indexed creator, string roomCode);
    event GameJoined(uint256 indexed gameId, address indexed opponent);
    event GameCompleted(uint256 indexed gameId, address indexed winner, uint8 player1Score, uint8 player2Score);
    event GameCancelled(uint256 indexed gameId);
    event GameExpired(uint256 indexed gameId);

    constructor() {
        oracle = msg.sender;
        nextGameId = 1;
    }

    function setOracle(address newOracle) external {
        require(msg.sender == oracle, "Not oracle");
        require(newOracle != address(0), "Zero address");
        oracle = newOracle;
    }

    function createGame(string calldata roomCode) external returns (uint256 gameId) {
        require(roomCodeToGameId[roomCode] == 0, "Room code in use");

        gameId = nextGameId++;
        games[gameId] = Game({
            id: gameId,
            creator: msg.sender,
            opponent: address(0),
            status: GameStatus.Waiting,
            winner: address(0),
            player1Score: 0,
            player2Score: 0,
            roomCode: roomCode,
            createdAt: block.timestamp
        });
        roomCodeToGameId[roomCode] = gameId;
        emit GameCreated(gameId, msg.sender, roomCode);
    }

    function joinGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Waiting, "Game not available");
        require(game.creator != msg.sender, "Cannot join own game");
        game.opponent = msg.sender;
        game.status = GameStatus.Active;
        emit GameJoined(gameId, msg.sender);
    }

    function submitResult(uint256 gameId, uint8 p1Score, uint8 p2Score) external {
        require(msg.sender == oracle, "Not oracle");

        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Game not active");
        require(p1Score != p2Score, "Tie not allowed");
        require(p1Score <= 10 && p2Score <= 10, "Score out of bounds");

        game.player1Score = p1Score;
        game.player2Score = p2Score;
        game.winner = p1Score > p2Score ? game.creator : game.opponent;
        game.status = GameStatus.Completed;

        playerStats[game.creator].gamesPlayed++;
        playerStats[game.opponent].gamesPlayed++;
        if (game.winner == game.creator) {
            playerStats[game.creator].wins++;
            playerStats[game.opponent].losses++;
        } else {
            playerStats[game.opponent].wins++;
            playerStats[game.creator].losses++;
        }

        delete roomCodeToGameId[game.roomCode];
        emit GameCompleted(gameId, game.winner, p1Score, p2Score);
    }

    function cancelGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.creator == msg.sender, "Not creator");
        require(game.status == GameStatus.Waiting, "Cannot cancel");
        game.status = GameStatus.Cancelled;
        delete roomCodeToGameId[game.roomCode];
        emit GameCancelled(gameId);
    }

    function expireGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Waiting, "Game not waiting");
        require(block.timestamp > game.createdAt + GAME_EXPIRY, "Not expired");
        game.status = GameStatus.Cancelled;
        delete roomCodeToGameId[game.roomCode];
        emit GameExpired(gameId);
    }

    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }

    function getGameByRoomCode(string calldata roomCode) external view returns (Game memory) {
        uint256 gameId = roomCodeToGameId[roomCode];
        return games[gameId];
    }
}
